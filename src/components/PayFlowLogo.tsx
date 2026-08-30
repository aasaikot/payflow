import React from 'react';

interface PayFlowLogoProps {
  iconSize?: number;
  fontSize?: number;
  showSubtitle?: boolean;
  isHorizontal?: boolean;
  className?: string;
}

export const PayFlowLogo: React.FC<PayFlowLogoProps> = ({
  iconSize = 52,
  fontSize = 26,
  showSubtitle = true,
  isHorizontal = false,
  className = '',
}) => {
  const icon = (
    <div
      id="payflow-logo-icon"
      className="bg-[#008F5B] flex items-center justify-center shadow-lg shadow-[#008F5B]/20 text-white font-extrabold select-none transition-transform hover:scale-105"
      style={{
        width: `${iconSize}px`,
        height: `${iconSize}px`,
        borderRadius: `${iconSize * 0.28}px`,
        fontSize: `${iconSize * 0.58}px`,
      }}
    >
      P
    </div>
  );

  const text = (
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
  );

  if (isHorizontal) {
    return (
      <div
        id="payflow-logo-horizontal"
        className={`flex items-center gap-3.5 ${className}`}
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
