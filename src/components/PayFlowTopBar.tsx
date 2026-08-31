import React from 'react';
import { MoreVertical } from 'lucide-react';

interface PayFlowTopBarProps {
  onMenuPressed?: () => void;
  className?: string;
}

/**
 * PayFlowTopBar
 * 
 * Mobile Top Navigation Bar component:
 * - Full-width, rectangular (no radius) fixed top navigation bar
 * - Clean, modern, premium minimalist appearance with subtle border and soft shadow
 * - Left side: Teal/cyan gradient rounded-square with stylized white "P" symbol and "PayFlow" typography (Pay: dark navy, Flow: teal/cyan)
 * - Right side: Subtle pale mint/teal circular button with teal vertical three-dot menu icon
 * - No user name, avatar, notifications, or search icons
 */
export const PayFlowTopBar: React.FC<PayFlowTopBarProps> = ({
  onMenuPressed,
  className = '',
}) => {
  return (
    <header
      id="payflow-top-bar-container"
      className={`sticky top-0 z-30 w-full bg-white border-b border-[#F1F5F9] shadow-[0_1px_6px_rgba(15,23,42,0.03)] px-4 sm:px-5 py-3 select-none flex items-center justify-between transition-all ${className}`}
    >
      {/* Left Side: PayFlow Logo & Brand Title */}
      <div id="payflow-brand-left" className="flex items-center gap-2.5">
        {/* Rounded-square logo with teal/cyan gradient and stylized "P" */}
        <div
          id="payflow-logo-badge"
          className="w-8.5 h-8.5 rounded-[10px] bg-gradient-to-br from-[#00A86B] via-[#008F5B] to-[#007A4D] flex items-center justify-center shadow-xs shadow-[#008F5B]/20 shrink-0"
        >
          <span className="text-white font-black text-[17px] tracking-tight leading-none drop-shadow-2xs">
            P
          </span>
        </div>

        {/* PayFlow Brand Name */}
        <div id="payflow-brand-text" className="flex items-baseline tracking-tight font-extrabold text-[19px] sm:text-[20px] leading-none">
          <span className="text-[#0F172A]">Pay</span>
          <span className="text-[#008F5B]">Flow</span>
        </div>
      </div>

      {/* Right Side: Circular Menu Button with Vertical Three-Dot */}
      <button
        type="button"
        id="payflow-top-menu-btn"
        onClick={() => {
          if (onMenuPressed) {
            onMenuPressed();
          }
        }}
        className="w-8.5 h-8.5 rounded-full bg-[#E9F7F1] hover:bg-[#D8F3E5] active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer border border-[#008F5B]/10 shadow-2xs"
        aria-label="Menu options"
      >
        <MoreVertical size={18} className="text-[#008F5B] stroke-[2.2]" />
      </button>
    </header>
  );
};
