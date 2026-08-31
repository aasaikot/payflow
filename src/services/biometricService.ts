/**
 * WebAuthn Biometric & Fingerprint Authentication Utility for PayFlow
 * Compatible with modern Android/iOS mobile fingerprint sensors, TouchID/FaceID, Windows Hello, and Passkeys.
 * Zero external cost, 100% standard W3C Web Authentication API.
 */

const STORAGE_KEY = 'payflow_biometric_credentials';
const LAST_BIOMETRIC_USER_KEY = 'payflow_last_biometric_user';

export interface BiometricCredentialInfo {
  uid: string;
  email: string;
  credentialId: string;
  createdAt: string;
  deviceName?: string;
}

// Convert string to Uint8Array buffer
function stringToBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to base64url string
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert base64url string to Uint8Array
function base64UrlToBuffer(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if the current browser and device support WebAuthn Biometrics (Fingerprint / Face Unlock / Platform Authenticator)
 */
export async function isBiometricAvailable(): Promise<{ available: boolean; reason?: string }> {
  if (typeof window === 'undefined') {
    return { available: false, reason: 'Window is not defined' };
  }

  if (!window.PublicKeyCredential) {
    return { available: false, reason: 'WebAuthn (Biometrics) is not supported on this browser' };
  }

  try {
    const isPlatformAuthenticatorAvailable =
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return {
      available: isPlatformAuthenticatorAvailable,
      reason: isPlatformAuthenticatorAvailable
        ? undefined
        : 'Platform biometric authenticator (Fingerprint/TouchID/FaceID) is not enabled on this device',
    };
  } catch (e: any) {
    // If checking fails, basic WebAuthn might still be functional
    return { available: true };
  }
}

/**
 * Gets the saved biometric credentials from local storage
 */
export function getSavedBiometricCredentials(): BiometricCredentialInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isInIFrame(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * Save Biometric enrollment directly (used by Android Biometric Prompt Modal)
 */
export function saveBiometricDirectly(
  uid: string,
  email: string,
  displayName?: string
): { success: boolean; message: string } {
  try {
    const existing = getSavedBiometricCredentials().filter(
      (c) => c.uid !== uid && c.email.toLowerCase() !== email.toLowerCase()
    );

    const newCred: BiometricCredentialInfo = {
      uid,
      email,
      credentialId: `bio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      deviceName: navigator.userAgent.includes('Android')
        ? 'Android Fingerprint Sensor'
        : 'Device Biometrics',
    };

    existing.push(newCred);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    localStorage.setItem(LAST_BIOMETRIC_USER_KEY, JSON.stringify({ uid, email }));

    return {
      success: true,
      message: 'ফিঙ্গারপ্রিন্ট সফলভাবে চালু (ON) হয়েছে! এখন লগইন স্ক্রিনে ফিঙ্গারপ্রিন্ট দিয়ে এক ক্লিকে ঢুকতে পারবেন।',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'ফিঙ্গারপ্রিন্ট সংরক্ষণ করা যায়নি।',
    };
  }
}

/**
 * Checks if a specific user (or any user) has biometric login enabled on this device
 */
export function isBiometricRegisteredForUser(uid?: string, email?: string): boolean {
  const credentials = getSavedBiometricCredentials();
  if (!credentials.length) return false;
  if (!uid && !email) return credentials.length > 0;
  return credentials.some(
    (c) => (uid && c.uid === uid) || (email && c.email.toLowerCase() === email.toLowerCase())
  );
}

export function getLastBiometricUser(): { uid: string; email: string } | null {
  try {
    const raw = localStorage.getItem(LAST_BIOMETRIC_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Register Fingerprint / Biometric key for the currently logged-in user
 */
export async function registerBiometrics(
  uid: string,
  email: string,
  displayName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, message: 'আপনার ব্রাউজার বা ডিভাইসে ফিঙ্গারপ্রিন্ট সেন্সর সাপোর্ট করছে না।' };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userIdBuffer = stringToBuffer(uid || email);

    // Dynamic origin host determination to prevent iframe/domain mismatch
    const currentHostname = window.location.hostname;

    const createCredentialOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: 'PayFlow Secure Payroll',
          ...(currentHostname && currentHostname !== 'localhost' ? { id: currentHostname } : {}),
        },
        user: {
          id: userIdBuffer,
          name: email,
          displayName: displayName || email.split('@')[0],
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
          { type: 'public-key', alg: -8 }, // Ed25519
        ],
        authenticatorSelection: {
          userVerification: 'preferred',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    };

    let credential: PublicKeyCredential | null = null;
    try {
      credential = (await navigator.credentials.create(
        createCredentialOptions
      )) as PublicKeyCredential | null;
    } catch (createErr: any) {
      // If error occurs with rp.id, retry with basic options
      if (createErr.name === 'SecurityError' || createErr.message?.includes('rpId')) {
        delete (createCredentialOptions.publicKey as any).rp.id;
        credential = (await navigator.credentials.create(
          createCredentialOptions
        )) as PublicKeyCredential | null;
      } else {
        throw createErr;
      }
    }

    if (!credential) {
      return { success: false, message: 'ফিঙ্গারপ্রিন্ট রেজিস্টার বাতিল করা হয়েছে।' };
    }

    const credentialId = bufferToBase64Url(credential.rawId);

    // Save to local device storage
    const existing = getSavedBiometricCredentials().filter(
      (c) => c.uid !== uid && c.email.toLowerCase() !== email.toLowerCase()
    );

    const newCred: BiometricCredentialInfo = {
      uid,
      email,
      credentialId,
      createdAt: new Date().toISOString(),
      deviceName: navigator.userAgent.includes('Android')
        ? 'Android Fingerprint'
        : navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
        ? 'Touch ID / Face ID'
        : 'Device Biometric',
    };

    existing.push(newCred);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    localStorage.setItem(LAST_BIOMETRIC_USER_KEY, JSON.stringify({ uid, email }));

    return {
      success: true,
      message: 'ফিঙ্গারপ্রিন্ট সফলভাবে চালু (ON) হয়েছে! এখন লগইন স্ক্রিনে ফিঙ্গারপ্রিন্ট দিয়ে ঢুকতে পারবেন।',
    };
  } catch (error: any) {
    console.warn('Biometric registration error:', error);
    if (error.name === 'NotAllowedError') {
      return {
        success: false,
        message: 'ফিঙ্গারপ্রিন্ট পপ-আপ বাতিল হয়েছে বা স্ক্যান করার সময় শেষ হয়ে গেছে। আবার চেষ্টা করতে টগলটি চালু করুন।',
      };
    }
    if (error.name === 'InvalidStateError') {
      return {
        success: false,
        message: 'এই ডিভাইসে আপনার ফিঙ্গারপ্রিন্ট ইতিমধ্যে রেজিস্টার করা আছে।',
      };
    }
    if (error.name === 'SecurityError') {
      return {
        success: false,
        message: 'সিকিউরিটি পলিসির কারণে আইফ্রেমে সরাসরি বায়োমেট্রিক ব্লক হতে পারে। অ্যাপটি ব্রাউজারের নতুন ট্যাবে ওপেন করে ট্রাই করুন।',
      };
    }
    return {
      success: false,
      message: error.message || 'বায়োমেট্রিক রেজিস্টার করতে সমস্যা হয়েছে। দয়া করে ডিভাইসের স্ক্রিন লক/ফিঙ্গারপ্রিন্ট চেক করুন।',
    };
  }
}

/**
 * Authenticate with Fingerprint / Biometric sensor
 */
export async function authenticateWithBiometrics(
  emailHint?: string
): Promise<{ success: boolean; email?: string; uid?: string; message: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, message: 'আপনার ব্রাউজার বা ডিভাইসে বায়োমেট্রিক সাপোর্ট করছে না।' };
    }

    const savedCredentials = getSavedBiometricCredentials();
    if (!savedCredentials.length) {
      return {
        success: false,
        message: 'এই ডিভাইসে কোনো ফিঙ্গারপ্রিন্ট সেটআপ নেই। প্রথমে পাসওয়ার্ড দিয়ে লগইন করে Profile থেকে Fingerprint Toggle টি ON করুন।',
      };
    }

    // Determine target credential
    let targetCred = savedCredentials[0];
    if (emailHint) {
      const matched = savedCredentials.find(
        (c) => c.email.toLowerCase() === emailHint.trim().toLowerCase()
      );
      if (matched) targetCred = matched;
    } else {
      const lastUser = getLastBiometricUser();
      if (lastUser) {
        const matched = savedCredentials.find((c) => c.uid === lastUser.uid);
        if (matched) targetCred = matched;
      }
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const allowCredentials: PublicKeyCredentialDescriptor[] = targetCred.credentialId
      ? [
          {
            id: base64UrlToBuffer(targetCred.credentialId),
            type: 'public-key',
            transports: ['internal'],
          },
        ]
      : [];

    const currentHostname = window.location.hostname;

    const getCredentialOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        ...(currentHostname && currentHostname !== 'localhost' ? { rpId: currentHostname } : {}),
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
        userVerification: 'preferred',
        timeout: 60000,
      },
    };

    let assertion: PublicKeyCredential | null = null;
    try {
      assertion = (await navigator.credentials.get(
        getCredentialOptions
      )) as PublicKeyCredential | null;
    } catch (authErr: any) {
      if (authErr.name === 'SecurityError' || authErr.message?.includes('rpId')) {
        delete (getCredentialOptions.publicKey as any).rpId;
        assertion = (await navigator.credentials.get(
          getCredentialOptions
        )) as PublicKeyCredential | null;
      } else {
        throw authErr;
      }
    }

    if (!assertion) {
      return { success: false, message: 'ফিঙ্গারপ্রিন্ট ভেরিফিকেশন বাতিল হয়েছে।' };
    }

    // Successfully verified by device biometric hardware!
    localStorage.setItem(
      LAST_BIOMETRIC_USER_KEY,
      JSON.stringify({ uid: targetCred.uid, email: targetCred.email })
    );

    return {
      success: true,
      email: targetCred.email,
      uid: targetCred.uid,
      message: 'ফিঙ্গারপ্রিন্ট সফলভাবে ভেরিফাই হয়েছে!',
    };
  } catch (error: any) {
    console.warn('Biometric authentication error:', error);
    if (error.name === 'NotAllowedError') {
      return {
        success: false,
        message: 'ফিঙ্গারপ্রিন্ট স্ক্যান বাতিল বা টাইমআউট হয়েছে। আবার ট্রাই করুন অথবা পাসওয়ার্ড দিয়ে লগইন করুন।',
      };
    }
    if (error.name === 'SecurityError') {
      return {
        success: false,
        message: 'সিকিউরিটি পলিসির কারণে আইফ্রেমে বায়োমেট্রিক সেন্সর ব্লক হতে পারে। অ্যাপটি ব্রাউজারের নতুন ট্যাবে ওপেন করে ট্রাই করুন।',
      };
    }
    return {
      success: false,
      message: error.message || 'ফিঙ্গারপ্রিন্ট দিয়ে লগইন করা যায়নি। পাসওয়ার্ড দিয়ে চেষ্টা করুন।',
    };
  }
}

/**
 * Remove saved biometrics for a user
 */
export function removeBiometricForUser(uid: string): void {
  try {
    const existing = getSavedBiometricCredentials().filter((c) => c.uid !== uid);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    const last = getLastBiometricUser();
    if (last && last.uid === uid) {
      localStorage.removeItem(LAST_BIOMETRIC_USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to remove biometric:', e);
  }
}
