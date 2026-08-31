import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Edit,
  Share2,
  CheckCircle2,
  Building2,
  User,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType, UserProfileData } from '../types';
import { formatBDT } from '../mockData';

interface SalaryDetailsViewProps {
  record: MonthSalaryRecord;
  userProfile?: UserProfileData;
  onNavigate: (screen: ScreenType) => void;
  onEditMonth: (month: string) => void;
}

export const SalaryDetailsView: React.FC<SalaryDetailsViewProps> = ({
  record,
  userProfile,
  onNavigate,
  onEditMonth,
}) => {
  const [selectedTab, setSelectedTab] = useState<'income' | 'deduction'>('income');
  const [copied, setCopied] = useState(false);
  const [isAmountMasked, setIsAmountMasked] = useState(false);

  const profile = userProfile || {
    name: 'Saikot Ahmed',
    companyName: 'Tech Solutions Ltd.',
    designation: 'Software Engineer',
    pin: '123456',
  };

  const isIncome = selectedTab === 'income';
  const gross = record.gross;
  const deduction = record.deduction;
  const net = record.net;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `PayFlow Salary Slip - ${record.monthLabel}: Gross: ${formatBDT(gross)}, Deduction: ${formatBDT(deduction)}, Net: ${formatBDT(net)}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const incomeEntries = Object.entries(record.incomes || {})
    .map(([k, v]) => [k, Number(v || 0)] as [string, number])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const deductionEntries = Object.entries(record.deductions || {})
    .map(([k, v]) => [k, Number(v || 0)] as [string, number])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div id="salary-details-screen" className="w-full flex flex-col pb-8">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="salary-details-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#17211D] tracking-tight leading-tight">
              {isIncome ? 'Income Details' : 'Deduction Details'}
            </h1>
            <span className="text-[10px] text-[#6E7974] font-medium block">
              {record.monthLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="share-slip-btn"
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer"
            title="Share Slip"
          >
            {copied ? <CheckCircle2 size={16} className="text-[#008F5B]" /> : <Share2 size={16} />}
          </button>

          <button
            type="button"
            id="edit-salary-btn"
            onClick={() => onEditMonth(record.month)}
            className="w-9 h-9 rounded-full bg-[#E9F7F1] border border-[#008F5B]/30 flex items-center justify-center text-[#008F5B] hover:bg-[#D4EFE4] transition-all cursor-pointer"
            title="Edit this month"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Modernized Hero Salary Slip Card - Matching Hero Salary Card Design */}
        <motion.div
          id="details-hero-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,143,91,0.18)] border relative transition-all duration-300 ${
            isIncome
              ? 'bg-gradient-to-br from-[#8EE5C7] via-[#56CCA3] to-[#25B584] border-[#2EB88A]/40'
              : 'bg-gradient-to-br from-[#FFC7C7] via-[#FFA3A3] to-[#FA6B6B] border-[#F87171]/40'
          }`}
        >
          {/* Modern Clean Multi-Layer Waves Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-90">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 300 160"
              preserveAspectRatio="none"
            >
              <path
                d="M0 80 C80 20 180 140 300 70 L300 160 L0 160 Z"
                fill={isIncome ? 'url(#details-wave-soft-1)' : 'url(#details-wave-deduct-1)'}
                opacity="0.35"
              />
              <path
                d="M160 160 C210 100 240 60 300 20 L300 160 Z"
                fill={isIncome ? 'url(#details-wave-soft-2)' : 'url(#details-wave-deduct-2)'}
                opacity="0.25"
              />
              {/* Delicate contour line waves */}
              <path
                d="M80 0 C130 50 200 90 300 60"
                stroke="white"
                strokeWidth="1.6"
                strokeOpacity="0.55"
                fill="none"
              />
              <path
                d="M130 160 C190 120 240 85 300 55"
                stroke="white"
                strokeWidth="1.4"
                strokeOpacity="0.45"
                fill="none"
              />
              <defs>
                <linearGradient id="details-wave-soft-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="details-wave-soft-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="details-wave-deduct-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="details-wave-deduct-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FECDD3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FB7185" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Main Top Section: Left Info List | Dashed Line | Net/Deduction Amount + Shield */}
          <div className="px-3.5 sm:px-4 pt-3.5 pb-3 flex items-center justify-between gap-2 relative z-10">
            {/* Left 4-item Info List */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              {/* 1. Company */}
              <div
                className={`flex items-start gap-2 min-w-0 ${
                  isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                }`}
              >
                <Building2
                  size={14}
                  className={`shrink-0 mt-0.5 stroke-[1.8] ${
                    isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                  }`}
                />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold leading-snug break-words">
                  {profile.companyName || 'Tech Solutions Ltd.'}
                </span>
              </div>

              {/* 2. Employee Name */}
              <div
                className={`flex items-start gap-2 min-w-0 ${
                  isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                }`}
              >
                <User
                  size={14}
                  className={`shrink-0 mt-0.5 stroke-[1.8] ${
                    isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                  }`}
                />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold leading-snug break-words">
                  {profile.name || 'Saikot Ahmed'}
                </span>
              </div>

              {/* 3. Designation */}
              <div
                className={`flex items-start gap-2 min-w-0 ${
                  isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                }`}
              >
                <Briefcase
                  size={14}
                  className={`shrink-0 mt-0.5 stroke-[1.8] ${
                    isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                  }`}
                />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold leading-snug break-words">
                  {profile.designation || 'Software Engineer'}
                </span>
              </div>

              {/* 4. PIN */}
              <div
                className={`flex items-center gap-2 min-w-0 ${
                  isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                }`}
              >
                <ShieldCheck
                  size={14}
                  className={`shrink-0 stroke-[1.8] ${
                    isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                  }`}
                />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold leading-none">
                  PIN: {profile.pin || '123456'}
                </span>
              </div>
            </div>

            {/* Dashed Vertical Divider */}
            <div
              className={`h-16 w-[1px] border-r border-dashed mx-1 shrink-0 self-center ${
                isIncome ? 'border-[#3CAE90]/70' : 'border-[#F87171]/70'
              }`}
            />

            {/* Right Side: Amount Block with Verified badge */}
            <div className="flex flex-col items-end justify-center shrink-0 pr-1">
              {/* Verified Pill Badge */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/40 border border-white/70 text-[8.5px] font-bold shadow-2xs mb-1">
                <ShieldCheck
                  size={10}
                  className={isIncome ? 'text-[#059669]' : 'text-[#D83B3B]'}
                />
                <span
                  className={`tracking-wide ${
                    isIncome ? 'text-[#0E3B2E]' : 'text-[#4A0E0E]'
                  }`}
                >
                  VERIFIED
                </span>
              </div>

              {/* Label (Uppercase) with Mask toggle */}
              <div
                className={`flex items-center justify-end gap-1 text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase leading-none ${
                  isIncome ? 'text-[#226352]' : 'text-[#8A1A1A]'
                }`}
              >
                <span>{isIncome ? 'NET AMOUNT' : 'TOTAL DEDUCTION'}</span>
                <button
                  type="button"
                  onClick={() => setIsAmountMasked(!isAmountMasked)}
                  className={`transition-colors cursor-pointer p-0.5 ${
                    isIncome
                      ? 'text-[#226352]/75 hover:text-[#0E3B2E]'
                      : 'text-[#8A1A1A]/75 hover:text-[#4A0E0E]'
                  }`}
                  title={isAmountMasked ? 'Show amount' : 'Hide amount'}
                >
                  {isAmountMasked ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
              </div>

              {/* Salary Font with .00 decimal format */}
              <motion.div
                key={isIncome ? net : deduction}
                initial={{ scale: 0.96, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mt-0.5 text-right"
              >
                <strong
                  className={`block text-[13px] sm:text-[15px] font-bold leading-none tracking-tight whitespace-nowrap ${
                    isIncome ? 'text-[#08281F]' : 'text-[#3E0909]'
                  }`}
                >
                  {isAmountMasked
                    ? '••••••••'
                    : formatBDT(isIncome ? net : deduction)}
                </strong>
              </motion.div>
            </div>
          </div>

          {/* Bottom Sub-Banner Ribbon: MONTH OF AUGUST 2026 */}
          <div
            className={`w-full border-t py-1 px-4 flex items-center justify-center text-center relative z-10 ${
              isIncome
                ? 'bg-[#B8EDDA]/80 border-[#9FE0CE]/80 text-[#1B5746]'
                : 'bg-[#FED7D7]/80 border-[#FEB2B2]/80 text-[#821818]'
            }`}
          >
            <span className="text-[8px] sm:text-[8.5px] font-bold tracking-[0.25em] uppercase">
              MONTH OF {record.monthLabel.toUpperCase()}
            </span>
          </div>
        </motion.div>

        {/* Tab Switcher (Income vs Deduction) */}
        <div
          id="details-tab-switcher"
          className="w-full flex items-center bg-[#EAEFEA]/80 p-1 rounded-xl border border-[#D7E0DC] shadow-inner"
        >
          <button
            type="button"
            id="tab-income-btn"
            onClick={() => setSelectedTab('income')}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center ${
              isIncome
                ? 'bg-[#008F5B] text-white shadow-xs'
                : 'text-[#6E7974] hover:text-[#17211D]'
            }`}
          >
            Income Breakdown ({incomeEntries.length})
          </button>
          <button
            type="button"
            id="tab-deduction-btn"
            onClick={() => setSelectedTab('deduction')}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center ${
              !isIncome
                ? 'bg-[#D83B3B] text-white shadow-xs'
                : 'text-[#6E7974] hover:text-[#17211D]'
            }`}
          >
            Deductions ({deductionEntries.length})
          </button>
        </div>

        {/* Itemized List with Visual Percentage Progress Bars */}
        <div
          id="details-itemized-card"
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#6E7974] uppercase tracking-wider">
              {isIncome ? 'Earning Components' : 'Deduction Components'}
            </span>
            <span className="text-[11px] font-extrabold text-[#17211D]">
              Total: {formatBDT(isIncome ? gross : deduction)}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#F0F4F2]">
            {(isIncome ? incomeEntries : deductionEntries).map(([key, value], idx) => {
              const numVal = Number(value || 0);

              return (
                <div key={key} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isIncome ? 'bg-[#008F5B]' : 'bg-[#D83B3B]'
                      }`}
                    />
                    <span className="font-semibold text-[#17211D] text-[13px]">{key}</span>
                  </div>
                  <strong
                    className={`text-[13.5px] font-bold ${
                      isIncome ? 'text-[#17211D]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {formatBDT(numVal)}
                  </strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Button Footer */}
        <button
          type="button"
          onClick={() => onEditMonth(record.month)}
          className="w-full py-3.5 rounded-xl bg-white border border-[#D7E0DC] hover:border-[#008F5B] text-xs font-extrabold text-[#008F5B] hover:bg-[#E9F7F1] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
        >
          <Edit size={14} />
          <span>Edit {record.monthLabel} Figures</span>
        </button>
      </div>
    </div>
  );
};
