import React, { useState } from 'react';

interface PayFlowLogoProps {
  iconSize?: number;
  fontSize?: number;
  showSubtitle?: boolean;
  isHorizontal?: boolean;
  className?: string;
  showBrandText?: boolean;
}

export const PayFlowLogo: React.FC<PayFlowLogoProps> = ({
  iconSize = 52,
  fontSize = 26,
  showSubtitle = true,
  isHorizontal = false,
  className = '',
  showBrandText = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const icon = (
    <div
      id="payflow-logo-icon"
      className="relative flex items-center justify-center shrink-0 select-none transition-transform hover:scale-105"
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
      }}
    >
      {!imgError ? (
        <img
          src="/logo.png"
          alt="PayFlow Logo"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain drop-shadow-md rounded-[22%]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="w-full h-full bg-gradient-to-br from-[#00A86B] via-[#008F5B] to-[#007A4D] rounded-[28%] flex items-center justify-center text-white font-black shadow-lg shadow-[#008F5B]/20"
          style={{
            fontSize: `${iconSize * 0.55}px`,
          }}
        >
          P
        </div>
      )}
    </div>
  );

  const text = showBrandText ? (
    <div
      id="payflow-logo-text"
      className={`flex flex-col ${isHorizontal ? 'items-start text-left' : 'items-center text-center'}`}
    >
      <div
        className="font-extrabold tracking-tight leading-none"
        style={{ fontSize: `${fontSize}px` }}
      >
        <span className="text-[#17211D]">Pay</span>
        <span className="text-[#008F5B]">Flow</span>
      </div>
      {showSubtitle && (
        <span
          className="text-[#6E7974] font-medium tracking-wide mt-1.5 leading-none"
          style={{ fontSize: `${Math.max(fontSize * 0.44, 11)}px` }}
        >
          Secure Salary Management
        </span>
      )}
    </div>
  ) : null;

  if (isHorizontal) {
    return (
      <div
        id="payflow-logo-horizontal"
        className={`flex items-center gap-3 ${className}`}
      >
        {icon}
        {text}
      </div>
    );
  }

  return (
    <div
      id="payflow-logo-vertical"
      className={`flex flex-col items-center gap-3 ${className}`}
    >
      {icon}
      {text}
    </div>
  );
};

