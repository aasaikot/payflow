import React from 'react';

interface BDTProps {
  amount: number | string;
  className?: string;
  symbolClassName?: string;
  decimals?: number;
  prefix?: string;
}

/**
 * Enhanced BDT currency renderer with a bold, enlarged, crisp ৳ symbol
 */
export const BDT: React.FC<BDTProps> = ({
  amount,
  className = '',
  symbolClassName = '',
  decimals = 2,
  prefix = '',
}) => {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0;
  const formatted = num.toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span
        className={`font-black text-[1.12em] leading-none inline-block mr-0.5 tracking-normal select-none ${symbolClassName}`}
      >
        ৳
      </span>
      <span>{formatted}</span>
    </span>
  );
};
