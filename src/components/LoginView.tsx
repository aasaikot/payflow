import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Fingerprint,
  CheckCircle2,
  Info,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { PayFlowLogo } from './PayFlowLogo';
import { auth, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from '../firebase';
import { signInWithGoogle } from '../services/firebaseService';
import {
  authenticateWithBiometrics,
  getSavedBiometricCredentials,
  getLastBiometricUser,
  isInIFrame,
} from '../services/biometricService';
import { FingerprintPromptModal } from './FingerprintPromptModal';

interface LoginViewProps {
  onNavigateToRegister: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (email: string, uid?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToRegister,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Field error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Biometric states
  const [hasBiometricEnrolled, setHasBiometricEnrolled] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [pendingBiometricUser, setPendingBiometricUser] = useState<{ email: string; uid?: string } | null>(null);

  useEffect(() => {
    const creds = getSavedBiometricCredentials();
    if (creds.length > 0) {
      setHasBiometricEnrolled(true);
      const last = getLastBiometricUser();
      if (last?.email) {
        if (!email) setEmail(last.email);
        setPendingBiometricUser(last);
      } else {
        setPendingBiometricUser({ email: creds[0].email, uid: creds[0].uid });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    let hasValidationError = false;

    if (!cleanEmail) {
      setEmailError('ইমেইল অ্যাড্রেস প্রদান করুন (Email is required).');
      hasValidationError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setEmailError('সঠিক ফরম্যাটের ইমেইল দিন (Invalid email format).');
        hasValidationError = true;
      }
    }

    if (!password) {
      setPasswordError('পাসওয়ার্ড প্রদান করুন (Password is required).');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setIsLoading(false);
      onLoginSuccess(userCredential.user.email || cleanEmail, userCredential.user.uid);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Firebase login error:', err?.code, err?.message);

      const errorCode = err?.code;

      if (errorCode === 'auth/user-not-found') {
        setEmailError('এই ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সঠিক ইমেইল দিন অথবা Register করুন।');
      } else if (errorCode === 'auth/wrong-password') {
        setPasswordError('ভুল পাসওয়ার্ড দিয়েছেন। দয়া করে সঠিক পাসওয়ার্ড দিন অথবা Forgot Password করুন।');
      } else if (errorCode === 'auth/invalid-credential') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
          if (methods.length === 0) {
            setEmailError('এই ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি (Account not found with this email).');
          } else {
            setPasswordError('ভুল পাসওয়ার্ড দিয়েছেন (Incorrect password).');
          }
        } catch {
          setPasswordError('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। দয়া করে যাচাই করে আবার চেষ্টা করুন।');
        }
      } else if (errorCode === 'auth/invalid-email') {
        setEmailError('ইমেইল অ্যাড্রেসের ফরম্যাটটি সঠিক নয় (Invalid email address).');
      } else if (errorCode === 'auth/too-many-requests') {
        setGeneralError('একাধিকবার ভুল চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।');
      } else if (errorCode === 'auth/network-request-failed') {
        setGeneralError('ইন্টারনেট সংযোগে সমস্যা হচ্ছে। আপনার নেটওয়ার্ক চেক করুন।');
      } else {
        setGeneralError(err?.message || 'লগইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setInfoMessage(null);

    try {
      const { user } = await signInWithGoogle();
      setIsGoogleLoading(false);
      onLoginSuccess(user.email || 'google.user@payflow.com', user.uid);
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.warn('Google sign in error:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      } else if (err?.code === 'auth/popup-blocked') {
        setGeneralError('Sign-in popup was blocked by browser. Please allow popups for PayFlow.');
      } else {
        setGeneralError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    }
  };

  const handleBiometricAuth = async () => {
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setInfoMessage(null);

    const creds = getSavedBiometricCredentials();
    const lastUser = getLastBiometricUser();
    if (creds.length === 0 && !lastUser && !email) {
      setGeneralError('এই ডিভাইসে কোনো ফিঙ্গারপ্রিন্ট রেজিস্টার করা নেই। প্রথমে পাসওয়ার্ড দিয়ে লগইন করে Profile থেকে Fingerprint Toggle টি ON করুন।');
      return;
    }

    let targetEmail = email || lastUser?.email || (creds[0] ? creds[0].email : '');
    let targetUid: string | undefined = lastUser?.uid || (creds[0] ? creds[0].uid : undefined);

    if (creds.length > 0) {
      const match = creds.find(c => targetEmail && c.email.toLowerCase() === targetEmail.toLowerCase()) || creds[0];
      targetEmail = match.email;
      targetUid = match.uid;
    }

    setPendingBiometricUser({ email: targetEmail || 'user@payflow.com', uid: targetUid });

    if (isInIFrame()) {
      setIsPromptModalOpen(true);
      return;
    }

    setIsBiometricLoading(true);
    try {
      const res = await authenticateWithBiometrics(targetEmail);
      setIsBiometricLoading(false);

      if (res.success && res.email) {
        setInfoMessage('ফিঙ্গারপ্রিন্ট ভেরিফিকেশন সফল হয়েছে! লগইন করা হচ্ছে...');
        onLoginSuccess(res.email, res.uid);
      } else {
        setIsPromptModalOpen(true);
      }
    } catch {
      setIsBiometricLoading(false);
      setIsPromptModalOpen(true);
    }
  };

  const handleModalSuccess = () => {
    setIsPromptModalOpen(false);
    const target = pendingBiometricUser || { email: email || 'user@payflow.com' };
    setInfoMessage('ফিঙ্গারপ্রিন্ট ভেরিফিকেশন সফল হয়েছে! প্রবেশ করা হচ্ছে...');
    onLoginSuccess(target.email, target.uid);
  };

  return (
    <div id="login-screen-container" className="w-full flex flex-col items-center py-5 px-3.5 sm:px-4 relative overflow-hidden">
      {/* Ambient Halo Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#008F5B]/15 dark:bg-[#008F5B]/20 blur-3xl rounded-full pointer-events-none" />

      {/* Top PayFlow Brand Identity */}
      <div className="w-full max-w-[420px] flex flex-col items-center mb-5 relative z-10">
        <div className="mb-4">
          <PayFlowLogo iconSize={48} fontSize={24} showSubtitle={true} />
        </div>

        {/* Floating Modern Pill Switcher */}
        <div
          id="auth-section-tabs"
          className="w-full max-w-[300px] p-1 bg-[#E8F2EC] dark:bg-[#121F19] rounded-2xl border border-[#D0E2D8] dark:border-[#1E3328] flex items-center shadow-inner mb-4"
        >
          {/* Active Tab: Sign In */}
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2C23] text-[#008F5B] dark:text-[#10E594] font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-xs border border-[#008F5B]/20 cursor-default transition-all"
          >
            <CheckCircle2 size={14} className="text-[#008F5B] dark:text-[#10E594]" />
            <span>Sign In</span>
          </button>

          {/* Inactive Tab: Register */}
          <button
            type="button"
            id="switch-mode-register-pill"
            onClick={onNavigateToRegister}
            className="flex-1 py-2 px-3 rounded-xl text-[#5C6E66] dark:text-[#8EA298] font-bold text-[13px] hover:text-[#17211D] dark:hover:text-[#F1F7F4] flex items-center justify-center transition-all cursor-pointer"
          >
            <span>Register</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-[22px] sm:text-[24px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[13px] text-[#6E7974] dark:text-[#8EA298] mt-1 font-medium">
            Sign in to access your secure salary vault & payslips
          </p>
        </div>
      </div>

      {/* General Error Message Box */}
      {generalError && (
        <div
          id="login-error-banner"
          className="w-full max-w-[420px] mb-4 p-3.5 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-2xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Info Message Box */}
      {infoMessage && (
        <div
          id="login-info-banner"
          className="w-full max-w-[420px] mb-4 p-3.5 bg-[#E9F7F1] dark:bg-[#122A1E] border border-[#008F5B]/30 rounded-2xl text-[#008F5B] dark:text-[#10E594] text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in"
        >
          <Info size={18} className="shrink-0 text-[#008F5B] dark:text-[#10E594]" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Premium Login Card */}
      <div
        id="login-card"
        className="w-full max-w-[420px] bg-white dark:bg-[#14221C] rounded-2xl p-6 sm:p-7 border border-[#E2EBE6] dark:border-[#21352C] shadow-[0_12px_36px_rgba(23,33,29,0.06)] relative z-10 transition-all"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-email-input"
                className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB]"
              >
                Work Email Address
              </label>
            </div>
            <div className="relative flex items-center group">
              <div className={`absolute left-3.5 w-8 h-8 rounded-xl ${emailError ? 'bg-[#FEF2F2] dark:bg-[#331416] text-[#D83B3B]' : 'bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594]'} flex items-center justify-center pointer-events-none transition-colors`}>
                <Mail size={16} />
              </div>
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="e.g. employee@company.com"
                className={`w-full h-[50px] pl-13 pr-4 rounded-xl border ${
                  emailError
                    ? 'border-[#D83B3B] bg-[#FFFBFB] dark:bg-[#201012] focus:border-[#D83B3B] focus:ring-4 focus:ring-[#D83B3B]/10 text-[#D83B3B]'
                    : 'border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 bg-[#FAFCFB] dark:bg-[#0E1814] text-[#17211D] dark:text-[#F1F7F4]'
                } outline-none text-[14px] font-semibold placeholder-[#9BAAA2] transition-all`}
                required
              />
            </div>
            {emailError && (
              <div id="login-email-error-text" className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-[#D83B3B] animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password-input"
                className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB]"
              >
                Password
              </label>
              <button
                id="forgot-password-link"
                type="button"
                onClick={onForgotPassword}
                className="text-[11.5px] font-bold text-[#008F5B] dark:text-[#10E594] hover:underline transition-all cursor-pointer flex items-center gap-1"
              >
                <KeyRound size={12} />
                <span>Forgot?</span>
              </button>
            </div>
            <div className="relative flex items-center group">
              <div className={`absolute left-3.5 w-8 h-8 rounded-xl ${passwordError ? 'bg-[#FEF2F2] dark:bg-[#331416] text-[#D83B3B]' : 'bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594]'} flex items-center justify-center pointer-events-none transition-colors`}>
                <Lock size={16} />
              </div>
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Enter your security password"
                className={`w-full h-[50px] pl-13 pr-11 rounded-xl border ${
                  passwordError
                    ? 'border-[#D83B3B] bg-[#FFFBFB] dark:bg-[#201012] focus:border-[#D83B3B] focus:ring-4 focus:ring-[#D83B3B]/10 text-[#D83B3B]'
                    : 'border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 bg-[#FAFCFB] dark:bg-[#0E1814] text-[#17211D] dark:text-[#F1F7F4]'
                } outline-none text-[14px] font-semibold placeholder-[#9BAAA2] transition-all`}
                required
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1.5 rounded-lg hover:bg-[#F0F5F2] dark:hover:bg-[#1A2C23] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {passwordError && (
              <div id="login-password-error-text" className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-[#D83B3B] animate-in fade-in">
                <AlertCircle size={13} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-0.5">
            <label
              id="remember-me-toggle"
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#008F5B] border-[#D5DFD9] dark:border-[#283E33] focus:ring-[#008F5B] accent-[#008F5B]"
              />
              <span className="text-[12.5px] text-[#5C6E66] dark:text-[#9DB3A8] font-medium">
                Keep session logged in
              </span>
            </label>
          </div>

          {/* Primary High-Grade Emerald Action Button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading || isGoogleLoading || isBiometricLoading}
            className="w-full h-[52px] mt-1 bg-gradient-to-r from-[#008F5B] via-[#009E65] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.98] disabled:opacity-75 text-white font-black text-[15px] rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#008F5B]/25 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-0.5">
            <div className="border-t border-[#E8F0EC] dark:border-[#21352C] w-full"></div>
            <span className="bg-white dark:bg-[#14221C] px-3 text-[11px] text-[#7C8E86] dark:text-[#8EA298] font-bold uppercase tracking-wider shrink-0">
              or quick access with
            </span>
          </div>

          {/* Alternative Auth Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Sign In */}
            <button
              id="google-login-button"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || isBiometricLoading}
              className="h-[46px] bg-[#FAFCFB] dark:bg-[#101A16] hover:bg-[#F0F6F2] dark:hover:bg-[#182820] active:scale-[0.98] disabled:opacity-75 border border-[#D5DFD9] dark:border-[#21352C] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#17211D] dark:text-[#F1F7F4] transition-all cursor-pointer shadow-xs"
            >
              {isGoogleLoading ? (
                <Loader2 size={16} className="animate-spin text-[#008F5B]" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>

            {/* Biometric Quick Login */}
            <button
              id="biometric-login-button"
              type="button"
              onClick={handleBiometricAuth}
              disabled={isLoading || isGoogleLoading || isBiometricLoading}
              className={`h-[46px] relative ${
                hasBiometricEnrolled
                  ? 'bg-gradient-to-r from-[#EAF8F2] to-[#DCF5E9] dark:from-[#11241B] dark:to-[#163024] border-[#008F5B]/50 dark:border-[#008F5B]/60 hover:border-[#008F5B] text-[#008F5B] dark:text-[#10E594] shadow-xs'
                  : 'bg-[#FAFCFB] dark:bg-[#101A16] hover:bg-[#F0F6F2] dark:hover:bg-[#182820] border-[#D5DFD9] dark:border-[#21352C] text-[#47544E] dark:text-[#9DB3A8]'
              } active:scale-[0.98] disabled:opacity-75 border rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs`}
              title={
                hasBiometricEnrolled
                  ? 'Sign in with saved fingerprint'
                  : 'Fingerprint Biometric Sign In'
              }
            >
              {isBiometricLoading ? (
                <Loader2 size={16} className="animate-spin text-[#008F5B]" />
              ) : (
                <>
                  <Fingerprint
                    size={17}
                    strokeWidth={2.2}
                    className={hasBiometricEnrolled ? 'text-[#008F5B] dark:text-[#10E594]' : 'text-[#6E7974] dark:text-[#8EA298]'}
                  />
                  <span>Fingerprint</span>
                  {hasBiometricEnrolled && (
                    <span className="w-2 h-2 rounded-full bg-[#008F5B] dark:bg-[#10E594] animate-pulse" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* Bottom Switch to Register */}
          <div className="text-center pt-2.5 border-t border-[#F0F6F2] dark:border-[#1E3027] mt-1 flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-[#6E7974] dark:text-[#8EA298]">
              New employee to PayFlow?
            </span>
            <button
              id="switch-to-register-btn"
              type="button"
              onClick={onNavigateToRegister}
              className="text-[13px] font-black text-[#008F5B] dark:text-[#10E594] hover:underline transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>

      {/* Security Trust Badge */}
      <div
        id="security-info-card"
        className="w-full max-w-[420px] mt-4 bg-white dark:bg-[#14221C] rounded-2xl p-3.5 border border-[#E2EBE6] dark:border-[#21352C] flex items-center gap-3 shadow-xs"
      >
        <div className="w-9 h-9 rounded-xl bg-[#E9F7F1] dark:bg-[#163024] flex items-center justify-center shrink-0 text-[#008F5B] dark:text-[#10E594]">
          <ShieldCheck size={20} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[12px] font-bold text-[#17211D] dark:text-[#F1F7F4] flex items-center gap-1">
            <span>256-bit Encrypted Vault</span>
            <Sparkles size={11} className="text-[#008F5B] dark:text-[#10E594]" />
          </span>
          <span className="text-[10.5px] text-[#6E7974] dark:text-[#8EA298] font-medium">
            Biometric protected & compliant with Bangladesh tax policies
          </span>
        </div>
      </div>

      {/* Fingerprint Modal */}
      <FingerprintPromptModal
        isOpen={isPromptModalOpen}
        mode="verify"
        userEmail={pendingBiometricUser?.email || email}
        onSuccess={handleModalSuccess}
        onCancel={() => setIsPromptModalOpen(false)}
      />
    </div>
  );
};
