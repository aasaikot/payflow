import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, X, ShieldAlert, Sparkles } from 'lucide-react';

interface FingerprintPromptModalProps {
  isOpen: boolean;
  mode: 'enroll' | 'verify';
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FingerprintPromptModal: React.FC<FingerprintPromptModalProps> = ({
  isOpen,
  mode,
  userEmail,
  userName,
  onSuccess,
  onCancel,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setScanState('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchSensor = () => {
    if (scanState === 'scanning' || scanState === 'success') return;

    setScanState('scanning');
    setErrorMessage('');

    // Simulate authentic Android biometric recognition (0.8s)
    setTimeout(() => {
      setScanState('success');
      setTimeout(() => {
        onSuccess();
      }, 700);
    }, 850);
  };

  return (
    <div
      id="fingerprint-biometric-modal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
    >
      <div
        className="w-full max-w-sm sm:rounded-3xl bg-white rounded-t-3xl border border-[#D5E5DC] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 flex flex-col p-6 text-center animate-in slide-in-from-bottom-6"
      >
        {/* Top Handle Bar for Android Sheet */}
        <div className="w-12 h-1.5 bg-[#D7E3DC] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h3 className="text-base font-extrabold text-[#17211D] flex items-center gap-1.5">
              <span>{mode === 'enroll' ? 'Enable Fingerprint' : 'Verify Identity'}</span>
              <span className="text-[10px] bg-[#E9F7F1] text-[#008F5B] px-2 py-0.5 rounded-full font-bold border border-[#008F5B]/20">
                PayFlow Secure
              </span>
            </h3>
            <p className="text-xs text-[#6E7974] mt-0.5">
              {mode === 'enroll'
                ? `Set up biometric login for ${userName || userEmail || 'your account'}`
                : `Confirm fingerprint for ${userEmail || 'PayFlow'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#F5FAF7] hover:bg-[#E4ECE8] text-[#6E7974] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Interactive Sensor Target */}
        <div className="my-7 flex flex-col items-center justify-center">
          <button
            type="button"
            id="touch-fingerprint-sensor-btn"
            onClick={handleTouchSensor}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer select-none group focus:outline-hidden ${
              scanState === 'success'
                ? 'bg-[#E9F7F1] border-2 border-[#008F5B] text-[#008F5B] scale-105 shadow-[0_0_30px_rgba(0,143,91,0.3)]'
                : scanState === 'scanning'
                ? 'bg-[#EBF7F2] border-2 border-[#008F5B]/60 text-[#008F5B] animate-pulse scale-98'
                : scanState === 'error'
                ? 'bg-[#FEF2F2] border-2 border-[#D83B3B] text-[#D83B3B]'
                : 'bg-gradient-to-br from-[#F5FAF7] to-[#E9F7F1] border-2 border-[#CBE0D6] hover:border-[#008F5B]/60 text-[#008F5B] hover:shadow-[0_8px_25px_rgba(0,143,91,0.15)] active:scale-95'
            }`}
          >
            {/* Ripple rings while scanning */}
            {scanState === 'scanning' && (
              <>
                <span className="absolute inset-0 rounded-full border-2 border-[#008F5B]/30 animate-ping" />
                <span className="absolute -inset-2 rounded-full border border-[#008F5B]/20 animate-pulse" />
              </>
            )}

            {scanState === 'success' ? (
              <CheckCircle2 size={54} strokeWidth={2.5} className="animate-in zoom-in-75 text-[#008F5B]" />
            ) : scanState === 'error' ? (
              <ShieldAlert size={50} strokeWidth={2} className="animate-in zoom-in-75 text-[#D83B3B]" />
            ) : (
              <Fingerprint
                size={54}
                strokeWidth={2}
                className={`transition-transform duration-300 group-hover:scale-110 ${
                  scanState === 'scanning' ? 'animate-bounce text-[#008F5B]' : 'text-[#008F5B]'
                }`}
              />
            )}
          </button>

          {/* Hint Text */}
          <div className="mt-4">
            {scanState === 'success' ? (
              <span className="text-xs font-bold text-[#008F5B] flex items-center justify-center gap-1">
                <Sparkles size={13} />
                <span>Fingerprint Recognized!</span>
              </span>
            ) : scanState === 'scanning' ? (
              <span className="text-xs font-semibold text-[#008F5B] animate-pulse">
                Verifying biometric key...
              </span>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#17211D]">
                  Touch the sensor above
                </span>
                <span className="text-[11px] text-[#8A9791] mt-0.5">
                  Tap the fingerprint icon to authenticate
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#EEF4F0]">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 rounded-xl border border-[#D7E3DC] text-xs font-bold text-[#6E7974] hover:bg-[#F5FAF7] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTouchSensor}
            disabled={scanState === 'scanning' || scanState === 'success'}
            className="w-1/2 py-2.5 rounded-xl bg-[#008F5B] hover:bg-[#007A4D] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Fingerprint size={14} />
            <span>{mode === 'enroll' ? 'Confirm' : 'Scan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
