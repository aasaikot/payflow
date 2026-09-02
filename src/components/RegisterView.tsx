import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  IdCard,
  Sparkles,
} from 'lucide-react';
import { PayFlowLogo } from './PayFlowLogo';
import { auth, createUserWithEmailAndPassword, updateProfile } from '../firebase';
import { saveUserProfile, signInWithGoogle } from '../services/firebaseService';

interface RegisterViewProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (email: string, uid?: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [fullName, setFullName] = useState('ASIF ARMAN SAIKOT');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('5556');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength score (0-4)
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecial ? 1 : 0);

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: 'Empty', color: 'bg-[#D7E0DC] dark:bg-[#20342A]', text: 'text-[#6E7974] dark:text-[#8EA298]' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-[#D83B3B]', text: 'text-[#D83B3B]' };
    if (strengthScore <= 3) return { label: 'Good', color: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' };
    return { label: 'Strong & Secure', color: 'bg-[#008F5B] dark:bg-[#10E594]', text: 'text-[#008F5B] dark:text-[#10E594]' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim().toUpperCase();
    const cleanEmail = email.trim();
    const cleanPin = employeeId.trim();

    if (!cleanName) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!cleanPin) {
      setError('Please provide your Employee PIN / ID.');
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError('Please ensure your password meets security criteria (8+ characters, 1 uppercase, 1 number).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms of service to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const uid = user.uid;

      try {
        await updateProfile(user, { displayName: cleanName });
      } catch (profErr) {
        console.warn('Profile name update note:', profErr);
      }

      await saveUserProfile({
        uid,
        name: cleanName,
        companyName: '',
        designation: '',
        pin: cleanPin,
        email: cleanEmail,
        mobile: '',
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      });

      setIsLoading(false);
      onRegisterSuccess(cleanEmail, uid);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Firebase registration error:', err?.code, err?.message);

      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please provide a valid email format.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 8 characters with letters and numbers.');
      } else if (err?.code === 'auth/network-request-failed') {
        setError('Network connection error. Please verify your internet connection.');
      } else {
        setError(err?.message || 'Registration could not be completed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { user } = await signInWithGoogle();
      setIsGoogleLoading(false);
      onRegisterSuccess(user.email || 'google.user@payflow.com', user.uid);
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.warn('Google registration error:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by browser. Please allow popups for PayFlow.');
      } else {
        setError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    }
  };

  return (
    <div id="register-screen-container" className="w-full flex flex-col items-center py-5 px-3.5 sm:px-4 relative overflow-hidden">
      {/* Ambient Halo Glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#008F5B]/15 dark:bg-[#008F5B]/20 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-[440px] flex flex-col items-center mb-5 relative z-10">
        <div className="mb-4">
          <PayFlowLogo iconSize={48} fontSize={24} showSubtitle={true} />
        </div>

        {/* Floating Modern Pill Switcher */}
        <div
          id="auth-section-tabs"
          className="w-full max-w-[300px] p-1 bg-[#E8F2EC] dark:bg-[#121F19] rounded-2xl border border-[#D0E2D8] dark:border-[#1E3328] flex items-center shadow-inner mb-4"
        >
          {/* Tab 1: Sign In (Inactive) */}
          <button
            type="button"
            id="switch-mode-login-pill"
            onClick={onNavigateToLogin}
            className="flex-1 py-2 px-3 rounded-xl text-[#5C6E66] dark:text-[#8EA298] font-bold text-[13px] hover:text-[#17211D] dark:hover:text-[#F1F7F4] flex items-center justify-center transition-all cursor-pointer"
          >
            <span>Sign In</span>
          </button>

          {/* Tab 2: Register (Active) */}
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2C23] text-[#008F5B] dark:text-[#10E594] font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-xs border border-[#008F5B]/20 cursor-default transition-all"
          >
            <CheckCircle2 size={14} className="text-[#008F5B] dark:text-[#10E594]" />
            <span>Register</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-[22px] sm:text-[24px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
            Create Profile
          </h1>
          <p className="text-[13px] text-[#6E7974] dark:text-[#8EA298] mt-1 font-medium">
            Set up your workspace credentials for automated salary records
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id="register-error-banner"
          className="w-full max-w-[440px] mb-4 p-3.5 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-2xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Registration Card */}
      <div
        id="register-card"
        className="w-full max-w-[440px] bg-white dark:bg-[#14221C] rounded-2xl p-6 sm:p-7 border border-[#E2EBE6] dark:border-[#21352C] shadow-[0_12px_36px_rgba(23,33,29,0.06)] relative z-10 transition-all"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="register-fullname-input"
              className="block text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB] mb-1"
            >
              Full Legal Name
            </label>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 w-8 h-8 rounded-xl bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594] flex items-center justify-center pointer-events-none transition-colors">
                <User size={16} />
              </div>
              <input
                id="register-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.toUpperCase())}
                placeholder="e.g. ASIF ARMAN SAIKOT"
                className="w-full h-[48px] pl-13 pr-4 rounded-xl border border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 outline-none text-[13.5px] font-bold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all uppercase"
                required
              />
            </div>
          </div>

          {/* 2-Column: Email & Employee PIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label
                htmlFor="register-email-input"
                className="block text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB] mb-1"
              >
                Work Email
              </label>
              <div className="relative flex items-center group">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594] flex items-center justify-center pointer-events-none transition-colors">
                  <Mail size={14} />
                </div>
                <input
                  id="register-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asif@company.com"
                  className="w-full h-[48px] pl-11 pr-3 rounded-xl border border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 outline-none text-[13px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all"
                  required
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label
                htmlFor="register-employee-id-input"
                className="block text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB] mb-1"
              >
                Employee PIN / ID
              </label>
              <div className="relative flex items-center group">
                <div className="absolute left-3 w-7 h-7 rounded-lg bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594] flex items-center justify-center pointer-events-none transition-colors">
                  <IdCard size={14} />
                </div>
                <input
                  id="register-employee-id-input"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="5556"
                  className="w-full h-[48px] pl-11 pr-3 rounded-xl border border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 outline-none text-[13px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="register-password-input"
                className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB]"
              >
                Password
              </label>
              {password.length > 0 && (
                <span className={`text-[11px] font-bold ${strength.text}`}>
                  {strength.label}
                </span>
              )}
            </div>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 w-8 h-8 rounded-xl bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594] flex items-center justify-center pointer-events-none transition-colors">
                <Lock size={16} />
              </div>
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full h-[48px] pl-13 pr-11 rounded-xl border border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all"
                required
              />
              <button
                type="button"
                id="toggle-register-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1.5 rounded-lg hover:bg-[#F0F5F2] dark:hover:bg-[#1A2C23] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Meter Bar */}
            {password.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 1 ? strength.color : 'bg-[#E2EBE6] dark:bg-[#20342A]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 2 ? strength.color : 'bg-[#E2EBE6] dark:bg-[#20342A]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 3 ? strength.color : 'bg-[#E2EBE6] dark:bg-[#20342A]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 4 ? strength.color : 'bg-[#E2EBE6] dark:bg-[#20342A]'}`} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="register-confirm-password-input"
                className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB]"
              >
                Confirm Password
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-bold ${passwordsMatch ? 'text-[#008F5B] dark:text-[#10E594]' : 'text-[#D83B3B]'}`}>
                  {passwordsMatch ? 'Passwords Match' : 'Mismatch'}
                </span>
              )}
            </div>
            <div className="relative flex items-center group">
              <div className="absolute left-3.5 w-8 h-8 rounded-xl bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] dark:group-focus-within:text-[#10E594] flex items-center justify-center pointer-events-none transition-colors">
                <Lock size={16} />
              </div>
              <input
                id="register-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full h-[48px] pl-13 pr-11 rounded-xl border outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-[#008F5B] dark:border-[#10E594] focus:ring-4 focus:ring-[#008F5B]/10'
                      : 'border-[#D83B3B] dark:border-[#D83B3B] focus:ring-4 focus:ring-[#D83B3B]/10'
                    : 'border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10'
                }`}
                required
              />
              <button
                type="button"
                id="toggle-register-confirm-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1.5 rounded-lg hover:bg-[#F0F5F2] dark:hover:bg-[#1A2C23] transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Interactive Criteria Chips */}
          <div
            id="password-requirements-card"
            className="w-full bg-[#F2F7F4] dark:bg-[#101A16] rounded-xl p-3 border border-[#D5DFD9] dark:border-[#21352C] flex flex-wrap gap-2"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasMinLength ? (
                <CheckCircle2 size={13} className="text-[#008F5B] dark:text-[#10E594]" />
              ) : (
                <Circle size={13} className="text-[#8A9791] dark:text-[#50635B]" />
              )}
              <span className={hasMinLength ? 'text-[#008F5B] dark:text-[#10E594] font-bold' : 'text-[#6E7974] dark:text-[#8EA298]'}>
                8+ Chars
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasUppercase ? (
                <CheckCircle2 size={13} className="text-[#008F5B] dark:text-[#10E594]" />
              ) : (
                <Circle size={13} className="text-[#8A9791] dark:text-[#50635B]" />
              )}
              <span className={hasUppercase ? 'text-[#008F5B] dark:text-[#10E594] font-bold' : 'text-[#6E7974] dark:text-[#8EA298]'}>
                Uppercase Letter
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasNumber ? (
                <CheckCircle2 size={13} className="text-[#008F5B] dark:text-[#10E594]" />
              ) : (
                <Circle size={13} className="text-[#8A9791] dark:text-[#50635B]" />
              )}
              <span className={hasNumber ? 'text-[#008F5B] dark:text-[#10E594] font-bold' : 'text-[#6E7974] dark:text-[#8EA298]'}>
                Number (0-9)
              </span>
            </div>
          </div>

          {/* Terms Acceptance */}
          <label className="flex items-start gap-2 pt-0.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#008F5B] border-[#D5DFD9] dark:border-[#283E33] focus:ring-[#008F5B] accent-[#008F5B]"
            />
            <span className="text-[11.5px] font-medium text-[#5C6E66] dark:text-[#8EA298] leading-tight">
              I agree to the PayFlow Terms of Service and Privacy Policy
            </span>
          </label>

          {/* Primary Submit Button */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-[52px] mt-1 bg-gradient-to-r from-[#008F5B] via-[#009E65] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.98] disabled:opacity-75 text-white font-black text-[15px] rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#008F5B]/25 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-0.5">
            <div className="border-t border-[#E8F0EC] dark:border-[#21352C] w-full"></div>
            <span className="bg-white dark:bg-[#14221C] px-3 text-[11px] text-[#7C8E86] dark:text-[#8EA298] font-bold uppercase tracking-wider shrink-0">
              or register with
            </span>
          </div>

          {/* Google Sign Up */}
          <button
            id="google-register-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
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
                <span>Continue with Google Workspace</span>
              </>
            )}
          </button>

          {/* Switch to Login */}
          <div className="text-center pt-2.5 border-t border-[#F0F6F2] dark:border-[#1E3027] mt-0.5 flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-[#6E7974] dark:text-[#8EA298]">
              Already registered?
            </span>
            <button
              id="switch-to-login-btn"
              type="button"
              onClick={onNavigateToLogin}
              className="text-[13px] font-black text-[#008F5B] dark:text-[#10E594] hover:underline transition-colors cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </form>
      </div>

      {/* Footer Trust Info */}
      <div className="mt-4 mb-2 text-center flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-[#008F5B] dark:text-[#10E594]" />
        <span className="text-[11.5px] font-semibold text-[#6E7974] dark:text-[#8EA298]">
          PayFlow • Unified Enterprise Compensation & Payroll
        </span>
      </div>
    </div>
  );
};
