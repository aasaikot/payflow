import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updateDoc,
  deleteField,
  User,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { getDocFromServer } from 'firebase/firestore';
import { MonthSalaryRecord, UserProfileData } from '../types';
import {
  RAW_FIREBASE_DATA,
  convertFirebaseMonthsToRecords,
  convertFirebaseProfileToUser,
  FirebaseUserData,
  FirebaseMonthData,
} from '../mockData';

// Ensure user has a valid Firebase Auth session
export async function autoSignInIfGuest(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.warn('Anonymous sign-in not available or skipped:', error);
    return null;
  }
}

// -------------------------------------------------------------
// Persistent Local Cache Layer for Seamless Biometric Unlock & Offline Access
// -------------------------------------------------------------
const CACHE_PREFIX = 'payflow_cached_user_';

export function getUserLocalCache(
  uid?: string,
  email?: string
): { profile: UserProfileData | null; records: MonthSalaryRecord[] } {
  try {
    let raw: string | null = null;
    if (uid) {
      raw = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
    }
    if (!raw && email) {
      raw = localStorage.getItem(`${CACHE_PREFIX}${email.trim().toLowerCase()}`);
    }
    if (!raw) {
      // Look for any cached user in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (
                (uid && parsed.profile?.uid === uid) ||
                (email && parsed.profile?.email?.toLowerCase() === email.trim().toLowerCase())
              ) {
                raw = item;
                break;
              }
            } catch {
              // ignore
            }
          }
        }
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        profile: parsed.profile || null,
        records: parsed.records || [],
      };
    }
  } catch (e) {
    console.warn('Local cache read note:', e);
  }
  return { profile: null, records: [] };
}

export function setUserLocalCache(
  uid: string,
  email: string,
  profile: UserProfileData | null,
  records: MonthSalaryRecord[]
): void {
  try {
    const payload = JSON.stringify({
      profile,
      records,
      updatedAt: Date.now(),
    });
    if (uid) {
      localStorage.setItem(`${CACHE_PREFIX}${uid}`, payload);
    }
    if (email) {
      localStorage.setItem(`${CACHE_PREFIX}${email.trim().toLowerCase()}`, payload);
    }
  } catch (e) {
    console.warn('Local cache write note:', e);
  }
}

// Google Sign-In with automated Profile & Photo sync
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfileData }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const uid = user.uid;
  const path = `users/${uid}`;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    // Retrieve any existing locally cached data for this user
    const localCached = getUserLocalCache(uid, user.email || '');

    let updatedProfile: UserProfileData;
    let finalRecords: MonthSalaryRecord[] = [];

    if (!snap.exists()) {
      // First time Google Sign-in: initialize user profile
      const newProfileData: FirebaseUserData['profile'] = {
        name: localCached.profile?.name || user.displayName || user.email?.split('@')[0]?.toUpperCase() || 'EMPLOYEE',
        companyName: localCached.profile?.companyName || '',
        designation: localCached.profile?.designation || '',
        pin: localCached.profile?.pin || '',
        email: user.email || localCached.profile?.email || '',
        mobile: localCached.profile?.mobile || user.phoneNumber || '',
        photoURL: user.photoURL || localCached.profile?.photoURL || undefined,
        joinDate: localCached.profile?.joinDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      };

      // If local cache had salary months, migrate them to Firestore
      const monthsPayload: Record<string, FirebaseMonthData> = {};
      if (localCached.records && localCached.records.length > 0) {
        localCached.records.forEach((r) => {
          monthsPayload[r.month] = {
            income: r.incomes,
            deduction: r.deductions,
            extraDeduction: r.extraDeduction || [],
            timestamp: Date.now(),
          };
        });
        finalRecords = localCached.records;
      }

      await setDoc(
        userDocRef,
        {
          profile: newProfileData,
          months: monthsPayload,
        },
        { merge: true }
      );

      updatedProfile = convertFirebaseProfileToUser(newProfileData, uid);
    } else {
      // Existing user: preserve custom company details but update Google avatar & email if available
      const existingData = snap.data() as Partial<FirebaseUserData>;
      const existingProfile = existingData.profile || {
        name: user.displayName || 'EMPLOYEE',
        companyName: '',
        designation: '',
        pin: '',
        email: user.email || '',
        mobile: '',
        photoURL: user.photoURL || undefined,
        joinDate: '',
      };

      const mergedProfilePayload: FirebaseUserData['profile'] = {
        name: existingProfile.name || localCached.profile?.name || user.displayName || 'EMPLOYEE',
        companyName: existingProfile.companyName || localCached.profile?.companyName || '',
        designation: existingProfile.designation || localCached.profile?.designation || '',
        pin: existingProfile.pin || localCached.profile?.pin || '',
        email: user.email || existingProfile.email || '',
        mobile: existingProfile.mobile || localCached.profile?.mobile || '',
        photoURL: user.photoURL || existingProfile.photoURL || localCached.profile?.photoURL,
        joinDate: existingProfile.joinDate || localCached.profile?.joinDate || '',
      };

      await setDoc(userDocRef, { profile: mergedProfilePayload }, { merge: true });
      updatedProfile = convertFirebaseProfileToUser(mergedProfilePayload, uid);

      if (existingData.months && Object.keys(existingData.months).length > 0) {
        finalRecords = convertFirebaseMonthsToRecords(existingData.months);
      } else if (localCached.records && localCached.records.length > 0) {
        finalRecords = localCached.records;
      }
    }

    // Persist to local cache for instant biometric unlocking
    setUserLocalCache(uid, user.email || '', updatedProfile, finalRecords);

    return { user, profile: updatedProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    const fallbackProfile: UserProfileData = {
      uid,
      name: user.displayName || 'Employee',
      email: user.email || '',
      companyName: '',
      designation: '',
      pin: '',
      mobile: '',
      photoURL: user.photoURL || undefined,
      joinDate: '',
    };
    setUserLocalCache(uid, user.email || '', fallbackProfile, []);
    return { user, profile: fallbackProfile };
  }
}

// Validate Connection to Firestore as required by SKILL.md
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!auth.currentUser) return true;
    await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable.');
    }
    return false;
  }
}

// User Profile Service
export async function fetchUserProfile(uid: string, emailHint?: string): Promise<UserProfileData | null> {
  const cached = getUserLocalCache(uid, emailHint);

  if (!uid) {
    return cached.profile;
  }

  // If authenticated with Firebase, fetch from Firestore and update cache
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<FirebaseUserData>;
        if (data.profile) {
          const profile = convertFirebaseProfileToUser(data.profile, uid);
          setUserLocalCache(uid, profile.email || emailHint || '', profile, cached.records);
          return profile;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  // Return cached profile for biometric unlock or offline state
  return cached.profile;
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  if (!profile.uid) return;

  // 1. Always update local storage cache immediately
  const cached = getUserLocalCache(profile.uid, profile.email);
  setUserLocalCache(profile.uid, profile.email, profile, cached.records);

  // 2. If authenticated in Firebase, sync to Firestore cloud
  if (auth.currentUser && auth.currentUser.uid === profile.uid) {
    const path = `users/${profile.uid}`;
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      const profilePayload: FirebaseUserData['profile'] = {
        name: profile.name,
        companyName: profile.companyName || '',
        designation: profile.designation || '',
        pin: profile.pin || '',
        email: profile.email || auth.currentUser.email || '',
        mobile: profile.mobile || '',
        photoURL: profile.photoURL,
        joinDate: profile.joinDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      };
      await setDoc(userDocRef, { profile: profilePayload }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
}

// Salary Records Service - reads and transforms exact Firebase document structure for the isolated user
export async function fetchSalaryRecords(uid: string, emailHint?: string): Promise<MonthSalaryRecord[]> {
  const cached = getUserLocalCache(uid, emailHint);

  if (!uid) {
    return cached.records;
  }

  // If authenticated in Firebase, fetch from Firestore cloud
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const data = snap.data() as Partial<FirebaseUserData>;
        if (data.months && Object.keys(data.months).length > 0) {
          const records = convertFirebaseMonthsToRecords(data.months);
          setUserLocalCache(uid, emailHint || cached.profile?.email || '', cached.profile, records);
          return records;
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  // Return locally cached salary records for biometric unlock or offline session
  return cached.records;
}

// Subscribe to realtime updates for a user's isolated data
export function subscribeToUserData(
  uid: string,
  onData: (data: { profile: UserProfileData | null; records: MonthSalaryRecord[] }) => void,
  onError?: (err: unknown) => void
) {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return () => {};
  }

  const path = `users/${uid}`;
  const userDocRef = doc(db, 'users', uid);

  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<FirebaseUserData>;
        const profile = data.profile
          ? convertFirebaseProfileToUser(data.profile, uid)
          : null;
        const records = data.months && Object.keys(data.months).length > 0
          ? convertFirebaseMonthsToRecords(data.months)
          : [];

        setUserLocalCache(uid, profile?.email || '', profile, records);
        onData({ profile, records });
      } else {
        onData({ profile: null, records: [] });
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// Save or update a single month's salary record in the user document
export async function saveSalaryRecord(
  uid: string,
  record: MonthSalaryRecord,
  emailHint?: string
): Promise<void> {
  if (!uid) return;

  // 1. Immediately update local cache so biometric mode has the latest records
  const cached = getUserLocalCache(uid, emailHint);
  const updatedRecords = [
    record,
    ...cached.records.filter((r) => r.month !== record.month),
  ].sort((a, b) => b.month.localeCompare(a.month));

  setUserLocalCache(
    uid,
    emailHint || cached.profile?.email || '',
    cached.profile,
    updatedRecords
  );

  // 2. If authenticated in Firebase, sync to Firestore cloud
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(db, 'users', uid);
      const monthData: FirebaseMonthData = {
        income: record.incomes,
        deduction: record.deductions,
        extraDeduction: record.extraDeduction || [],
        timestamp: Date.now(),
      };

      await setDoc(
        userDocRef,
        {
          months: {
            [record.month]: monthData,
          },
        },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }
}

// Delete a salary record from user's months in Firestore
export async function deleteSalaryRecord(
  uid: string,
  monthKey: string,
  emailHint?: string
): Promise<void> {
  if (!uid) return;

  // 1. Immediately remove from local cache
  const cached = getUserLocalCache(uid, emailHint);
  const updatedRecords = cached.records.filter((r) => r.month !== monthKey);

  setUserLocalCache(
    uid,
    emailHint || cached.profile?.email || '',
    cached.profile,
    updatedRecords
  );

  // 2. If authenticated in Firebase, remove from Firestore cloud
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const path = `users/${uid}`;
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        [`months.${monthKey}`]: deleteField(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  }
}

// Ensure user document exists with isolated empty structure if not already initialized
export async function seedInitialData(uid: string): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(
        userDocRef,
        {
          profile: {
            name: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]?.toUpperCase() || 'USER',
            email: auth.currentUser.email || '',
            companyName: '',
            designation: '',
            pin: '',
            mobile: auth.currentUser.phoneNumber || '',
            joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
          },
          months: {},
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('User initialization note:', error);
  }
}

// Auth Helper Functions
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
};
export type { User };

