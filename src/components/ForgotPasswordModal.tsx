import React, { useState } from 'react';
import { KeyRound, X, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { auth, sendPasswordResetEmail } from '../firebase';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid work email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      setIsLoading(false);
      setIsSuccess(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        id="forgot-password-modal-card"
        className="bg-white dark:bg-[#14221C] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2EBE6] dark:border-[#21352C] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="forgot-password-close-btn"
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 text-[#6E7974] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] hover:bg-[#F2F7F4] dark:hover:bg-[#1A2C23] rounded-xl transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div id="forgot-password-success" className="text-center py-3">
            <div className="w-14 h-14 bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="text-xl font-black text-[#17211D] dark:text-[#F1F7F4] mb-2 tracking-tight">
              Reset Link Dispatched!
            </h3>
            <p className="text-[13.5px] text-[#6E7974] dark:text-[#8EA298] leading-relaxed mb-6 font-medium">
              A secure password reset link has been dispatched to{' '}
              <strong className="text-[#17211D] dark:text-[#F1F7F4]">{email}</strong>. Please check your inbox and spam folder.
            </p>
            <button
              id="forgot-password-done-btn"
              onClick={handleClose}
              className="w-full h-[48px] bg-gradient-to-r from-[#008F5B] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] text-white font-extrabold text-[14.5px] rounded-xl shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form id="forgot-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594] rounded-2xl flex items-center justify-center mb-1 shadow-xs">
              <KeyRound size={22} />
            </div>

            <div>
              <h3 className="text-[20px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
                Reset Password
              </h3>
              <p className="text-[13px] text-[#6E7974] dark:text-[#8EA298] mt-1 leading-relaxed font-medium">
                Enter your registered work email and we'll send a password recovery link to your inbox.
              </p>
            </div>

            {error && (
              <div
                id="forgot-password-error"
                className="p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-password-email"
                className="block text-[11.5px] font-extrabold uppercase tracking-wider text-[#47544E] dark:text-[#B2C4BB] mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative flex items-center group">
                <div className="absolute left-3.5 w-7 h-7 rounded-lg bg-[#F2F7F4] dark:bg-[#1A2C23] text-[#5C6E66] dark:text-[#8EA298] group-focus-within:text-[#008F5B] group-focus-within:bg-[#E9F7F1] flex items-center justify-center pointer-events-none transition-colors">
                  <Mail size={15} />
                </div>
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. employee@company.com"
                  className="w-full h-[48px] pl-12 pr-4 rounded-xl border border-[#D5DFD9] dark:border-[#283E33] focus:border-[#008F5B] focus:ring-4 focus:ring-[#008F5B]/10 outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] bg-[#FAFCFB] dark:bg-[#0E1814] transition-all"
                  required
                />
              </div>
            </div>

            <button
              id="forgot-password-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] mt-1 bg-gradient-to-r from-[#008F5B] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.98] disabled:opacity-75 text-white font-extrabold text-[14.5px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
