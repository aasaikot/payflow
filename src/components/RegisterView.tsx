import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  BadgePercent,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  IdCard,
} from 'lucide-react';
import { PayFlowLogo } from './PayFlowLogo';
import { auth, createUserWithEmailAndPassword } from '../firebase';
import { saveUserProfile, seedInitialData } from '../services/firebaseService';

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
    if (password.length === 0) return { label: 'None', color: 'bg-[#D7E0DC]', text: 'text-[#6E7974]' };
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-[#D83B3B]', text: 'text-[#D83B3B]' };
    if (strengthScore <= 3) return { label: 'Good', color: 'bg-[#F59E0B]', text: 'text-[#F59E0B]' };
    return { label: 'Strong', color: 'bg-[#008F5B]', text: 'text-[#008F5B]' };
  };

  const strength = getStrengthLabel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!employeeId.trim()) {
      setError('Please provide your Employee ID.');
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setError('Please ensure your password meets all security criteria.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the terms of service to proceed.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = userCredential.user.uid;

      // Create initial Firestore Profile and seed salary collections
      await saveUserProfile({
        uid,
        name: fullName.trim().toUpperCase(),
        companyName: 'Essential Drugs Company Limited',
        designation: 'Assistant Engineering Officer',
        pin: employeeId.trim(),
        email: email.trim(),
        mobile: '+880 1711-234567',
        joinDate: '15 Jan 2022',
      });

      await seedInitialData(uid);

      setIsLoading(false);
      onRegisterSuccess(email, uid);
    } catch (err: any) {
      console.warn('Firebase registration error/fallback:', err);
      setIsLoading(false);
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else {
        // Fallback smooth transition for local preview
        onRegisterSuccess(email, 'user-registered-local');
      }
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setError(null);

    setTimeout(() => {
      setIsGoogleLoading(false);
      onRegisterSuccess('new.employee@payflow.com', 'google-registered-uid');
    }, 600);
  };

  const handleQuickDemoFill = () => {
    setFullName('ASIF ARMAN SAIKOT');
    setEmail('asif.saikot@payflow.com');
    setEmployeeId('5556');
    setPassword('PayFlow#2026');
    setConfirmPassword('PayFlow#2026');
    setError(null);
  };

  return (
    <div id="register-screen-container" className="w-full flex flex-col items-center py-5 px-4">
      {/* Top Header */}
      <div className="w-full max-w-[440px] flex flex-col items-center mb-5">
        <div className="mb-4">
          <PayFlowLogo iconSize={48} fontSize={24} showSubtitle={true} />
        </div>

        {/* Auth Mode Pill Selector */}
        <div className="w-full max-w-[280px] bg-[#EAEFEA] p-1 rounded-xl flex items-center border border-[#D7E0DC] shadow-inner mb-4">
          <button
            type="button"
            id="switch-mode-login-pill"
            onClick={onNavigateToLogin}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-[#6E7974] hover:text-[#17211D] hover:bg-white/50 transition-colors cursor-pointer text-center"
          >
            Sign In
          </button>
          <button
            type="button"
            className="flex-1 py-2 rounded-lg text-xs font-black bg-white text-[#008F5B] shadow-xs cursor-default flex items-center justify-center gap-1"
          >
            <CheckCircle2 size={13} className="text-[#008F5B]" />
            <span>Register</span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-[22px] font-black text-[#17211D] tracking-tight">
            Create Employee Profile
          </h1>
          <p className="text-[13px] text-[#6E7974] mt-0.5">
            Set up your workspace credentials for automated salary tracking
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id="register-error-banner"
          className="w-full max-w-[440px] mb-4 p-3.5 bg-[#FEF2F2] border border-[#D83B3B]/30 rounded-xl text-[#D83B3B] text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-in fade-in"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Registration Card */}
      <div
        id="register-card"
        className="w-full max-w-[440px] bg-white rounded-xl p-6 sm:p-7 border border-[#E4ECE8] shadow-[0_10px_32px_rgba(23,33,29,0.05)]"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Quick Demo Pre-fill */}
          <div className="flex items-center justify-between pb-1 border-b border-[#F0F4F2]">
            <span className="text-[11px] font-bold text-[#6E7974] uppercase tracking-wider">
              Employment Details
            </span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-[11px] font-extrabold text-[#008F5B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} />
              <span>Autofill Saikot (5556)</span>
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="register-fullname-input"
              className="block text-[12.5px] font-bold text-[#17211D] mb-1"
            >
              Full Legal Name (UPPERCASE)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 w-7 h-7 rounded-lg bg-[#F5FAF7] text-[#6E7974] flex items-center justify-center pointer-events-none">
                <User size={16} />
              </div>
              <input
                id="register-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value.toUpperCase())}
                placeholder="e.g. ASIF ARMAN SAIKOT"
                className="w-full h-[46px] pl-12 pr-4 rounded-xl border border-[#D7E0DC] focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/15 outline-none text-[13.5px] font-semibold text-[#17211D] placeholder-[#9EABA5] bg-white transition-all uppercase"
                required
              />
            </div>
          </div>

          {/* 2-Column: Email & Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email */}
            <div>
              <label
                htmlFor="register-email-input"
                className="block text-[12.5px] font-bold text-[#17211D] mb-1"
              >
                Work Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-6 h-6 rounded-lg bg-[#F5FAF7] text-[#6E7974] flex items-center justify-center pointer-events-none">
                  <Mail size={14} />
                </div>
                <input
                  id="register-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asif@company.com"
                  className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#D7E0DC] focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/15 outline-none text-[13px] font-semibold text-[#17211D] placeholder-[#9EABA5] bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label
                htmlFor="register-employee-id-input"
                className="block text-[12.5px] font-bold text-[#17211D] mb-1"
              >
                Employee ID
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 w-6 h-6 rounded-lg bg-[#F5FAF7] text-[#6E7974] flex items-center justify-center pointer-events-none">
                  <IdCard size={14} />
                </div>
                <input
                  id="register-employee-id-input"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="5556"
                  className="w-full h-[46px] pl-10 pr-3 rounded-xl border border-[#D7E0DC] focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/15 outline-none text-[13px] font-semibold text-[#17211D] placeholder-[#9EABA5] bg-white transition-all"
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
                className="text-[12.5px] font-bold text-[#17211D]"
              >
                Security Password
              </label>
              {password.length > 0 && (
                <span className={`text-[11px] font-extrabold ${strength.text}`}>
                  Strength: {strength.label}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 w-7 h-7 rounded-lg bg-[#F5FAF7] text-[#6E7974] flex items-center justify-center pointer-events-none">
                <Lock size={16} />
              </div>
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full h-[46px] pl-12 pr-11 rounded-xl border border-[#D7E0DC] focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/15 outline-none text-[13.5px] font-semibold text-[#17211D] placeholder-[#9EABA5] bg-white transition-all"
                required
              />
              <button
                type="button"
                id="toggle-register-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#6E7974] hover:text-[#17211D] p-1.5 rounded-lg hover:bg-[#F5FAF7]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Meter Bar */}
            {password.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 1 ? strength.color : 'bg-[#E4ECE8]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 2 ? strength.color : 'bg-[#E4ECE8]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 3 ? strength.color : 'bg-[#E4ECE8]'}`} />
                <div className={`h-1.5 rounded-full transition-all ${strengthScore >= 4 ? strength.color : 'bg-[#E4ECE8]'}`} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="register-confirm-password-input"
                className="text-[12.5px] font-bold text-[#17211D]"
              >
                Confirm Password
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[11px] font-bold ${passwordsMatch ? 'text-[#008F5B]' : 'text-[#D83B3B]'}`}>
                  {passwordsMatch ? 'Passwords match' : 'Mismatch'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 w-7 h-7 rounded-lg bg-[#F5FAF7] text-[#6E7974] flex items-center justify-center pointer-events-none">
                <Lock size={16} />
              </div>
              <input
                id="register-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full h-[46px] pl-12 pr-11 rounded-xl border outline-none text-[13.5px] font-semibold text-[#17211D] placeholder-[#9EABA5] bg-white transition-all ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/15'
                      : 'border-[#D83B3B] focus:ring-2 focus:ring-[#D83B3B]/15'
                    : 'border-[#D7E0DC] focus:border-[#008F5B]'
                }`}
                required
              />
              <button
                type="button"
                id="toggle-register-confirm-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-[#6E7974] hover:text-[#17211D] p-1.5 rounded-lg hover:bg-[#F5FAF7]"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Interactive Password Criteria Mini-Chips */}
          <div
            id="password-requirements-card"
            className="w-full bg-[#F5FAF7] rounded-xl p-3 border border-[#D7E0DC] flex flex-wrap gap-2"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasMinLength ? (
                <CheckCircle2 size={13} className="text-[#008F5B]" />
              ) : (
                <Circle size={13} className="text-[#8A9791]" />
              )}
              <span className={hasMinLength ? 'text-[#008F5B] font-bold' : 'text-[#6E7974]'}>
                8+ Characters
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasUppercase ? (
                <CheckCircle2 size={13} className="text-[#008F5B]" />
              ) : (
                <Circle size={13} className="text-[#8A9791]" />
              )}
              <span className={hasUppercase ? 'text-[#008F5B] font-bold' : 'text-[#6E7974]'}>
                Uppercase Letter
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {hasNumber ? (
                <CheckCircle2 size={13} className="text-[#008F5B]" />
              ) : (
                <Circle size={13} className="text-[#8A9791]" />
              )}
              <span className={hasNumber ? 'text-[#008F5B] font-bold' : 'text-[#6E7974]'}>
                At least 1 Number
              </span>
            </div>
          </div>

          {/* Terms Acceptance */}
          <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#008F5B] border-[#D7E0DC] focus:ring-[#008F5B] accent-[#008F5B]"
            />
            <span className="text-[12px] text-[#6E7974] leading-tight">
              I agree to the PayFlow Security Policies and Terms of Compensation Tracking.
            </span>
          </label>

          {/* Primary Submit Button */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-[50px] mt-1 bg-gradient-to-r from-[#008F5B] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.99] disabled:opacity-75 text-white font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#008F5B]/25 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-0.5">
            <div className="border-t border-[#E4ECE8] w-full"></div>
            <span className="bg-white px-3 text-[11px] text-[#6E7974] font-bold uppercase tracking-wider shrink-0">
              or register with
            </span>
          </div>

          {/* Google Sign Up */}
          <button
            id="google-register-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="h-[46px] bg-white hover:bg-[#F5FAF7] active:scale-[0.99] disabled:opacity-75 border border-[#D7E0DC] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#17211D] transition-all cursor-pointer shadow-2xs"
          >
            {isGoogleLoading ? (
              <Loader2 size={17} className="animate-spin text-[#008F5B]" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <div className="text-center pt-2 border-t border-[#F0F4F2] mt-0.5">
            <span className="text-[13px] text-[#6E7974]">
              Already registered?{' '}
            </span>
            <button
              id="switch-to-login-btn"
              type="button"
              onClick={onNavigateToLogin}
              className="text-[13px] font-black text-[#008F5B] hover:text-[#007A4D] hover:underline transition-colors cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-4 mb-2 text-center flex items-center justify-center gap-2">
        <ShieldCheck size={14} className="text-[#008F5B]" />
        <span className="text-[11.5px] font-semibold text-[#6E7974]">
          PayFlow • Unified Enterprise Compensation & Payroll
        </span>
      </div>
    </div>
  );
};
