import React, { useState, useMemo } from 'react';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  PlusCircle,
  MinusCircle,
  ArrowUpDown,
  Percent,
  Wallet,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType, UserProfileData } from '../types';
import { formatBDT } from '../mockData';
import { BDT } from './BDT';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface SalaryDetailsViewProps {
  record: MonthSalaryRecord;
  salaryRecords?: MonthSalaryRecord[];
  userProfile?: UserProfileData;
  onNavigate: (screen: ScreenType) => void;
  onEditMonth: (month: string) => void;
  onDeleteRecord?: (month: string) => Promise<void> | void;
}

export const SalaryDetailsView: React.FC<SalaryDetailsViewProps> = ({
  record,
  salaryRecords = [],
  userProfile,
  onNavigate,
  onEditMonth,
  onDeleteRecord,
}) => {
  const [selectedTab, setSelectedTab] = useState<'income' | 'deduction'>('income');
  const [graphTab, setGraphTab] = useState<'income' | 'deduction'>('income');
  const [copied, setCopied] = useState(false);
  const [isAmountMasked, setIsAmountMasked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async (month: string) => {
    if (!onDeleteRecord) return;
    setIsDeleting(true);
    try {
      await onDeleteRecord(month);
      setIsDeleteModalOpen(false);
      onNavigate('history');
    } finally {
      setIsDeleting(false);
    }
  };

  const profile = userProfile || {
    name: '',
    companyName: '',
    designation: '',
    pin: '',
  };

  if (!record) {
    return (
      <div id="salary-details-empty-screen" className="w-full flex flex-col pb-8">
        <div className="w-full flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[17px] font-extrabold text-[#17211D] tracking-tight">
              Salary Details
            </h1>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-center mt-12">
          <Layers size={48} className="text-[#8A9791] mb-3" />
          <h2 className="text-base font-bold text-[#17211D]">No Salary Record Selected</h2>
          <p className="text-xs text-[#6E7974] mt-1 max-w-xs">
            There are no salary records in your account yet. Add a monthly salary record to inspect its detailed breakdown.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('add')}
            className="mt-5 px-5 py-2.5 bg-[#008F5B] text-white text-xs font-bold rounded-xl hover:bg-[#007A4D] transition-all shadow-sm cursor-pointer"
          >
            + Add Salary Record
          </button>
        </div>
      </div>
    );
  }

  const isIncome = selectedTab === 'income';
  const gross = record.gross || 0;
  const deduction = record.deduction || 0;
  const net = record.net || 0;

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

  // Color palettes for graphical distribution
  const incomeColors = [
    '#008F5B', // Primary Emerald
    '#00B371', // Bright Mint
    '#0EA5E9', // Sky Blue
    '#10B981', // Teal Green
    '#6366F1', // Indigo
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
  ];

  const deductionColors = [
    '#D83B3B', // Crimson Red
    '#EA580C', // Deep Orange
    '#F97316', // Orange
    '#E11D48', // Rose
    '#DC2626', // Red
    '#B91C1C', // Dark Red
    '#7C2D12', // Rust
    '#991B1B', // Wine
  ];

  // Find previous month record for Short Comparison
  const sortedAllRecords = useMemo(() => {
    return [...salaryRecords].sort((a, b) => b.month.localeCompare(a.month));
  }, [salaryRecords]);

  const previousRecord = useMemo(() => {
    const currentIdx = sortedAllRecords.findIndex((r) => r.month === record.month);
    if (currentIdx !== -1 && currentIdx < sortedAllRecords.length - 1) {
      return sortedAllRecords[currentIdx + 1];
    }
    // If it is the oldest, fallback to whatever other record exists
    return sortedAllRecords.find((r) => r.month !== record.month) || null;
  }, [sortedAllRecords, record.month]);

  // Comparison metrics
  const netDiff = previousRecord ? record.net - previousRecord.net : 0;
  const netDiffPct =
    previousRecord && previousRecord.net > 0
      ? Number(((netDiff / previousRecord.net) * 100).toFixed(1))
      : 0;

  const grossDiff = previousRecord ? record.gross - previousRecord.gross : 0;
  const grossDiffPct =
    previousRecord && previousRecord.gross > 0
      ? Number(((grossDiff / previousRecord.gross) * 100).toFixed(1))
      : 0;

  const dedDiff = previousRecord ? record.deduction - previousRecord.deduction : 0;
  const dedDiffPct =
    previousRecord && previousRecord.deduction > 0
      ? Number(((dedDiff / previousRecord.deduction) * 100).toFixed(1))
      : 0;

  return (
    <div id="salary-details-screen" className="w-full flex flex-col pb-8">
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        record={record}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

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

        <div className="flex items-center gap-1.5">
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

          <button
            type="button"
            id="delete-salary-btn"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-9 h-9 rounded-full bg-[#FFF0F0] border border-[#FDCFD4] flex items-center justify-center text-[#D83B3B] hover:bg-[#FCE2E2] active:scale-95 transition-all cursor-pointer"
            title="Delete this record"
            aria-label="Delete Record"
          >
            <Trash2 size={16} />
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
                  {profile.companyName || 'PayFlow Workspace'}
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
                  {isAmountMasked ? (
                    '••••••••'
                  ) : (
                    <BDT
                      amount={isIncome ? net : deduction}
                      symbolClassName={`text-[1.22em] font-black mr-0.5 ${
                        isIncome ? 'text-[#08281F]' : 'text-[#3E0909]'
                      }`}
                    />
                  )}
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
          className="w-full bg-white rounded-2xl border border-[#008F5B] overflow-hidden flex items-stretch shadow-2xs"
        >
          <button
            type="button"
            id="tab-income-btn"
            onClick={() => {
              setSelectedTab('income');
              setGraphTab('income');
            }}
            className={`flex-1 py-3 px-3 flex items-center justify-center text-center cursor-pointer transition-all ${
              isIncome
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <span className="text-[13.5px] sm:text-[14px] leading-tight">
              Income Breakdown
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-[#008F5B] self-stretch shrink-0" />

          <button
            type="button"
            id="tab-deduction-btn"
            onClick={() => {
              setSelectedTab('deduction');
              setGraphTab('deduction');
            }}
            className={`flex-1 py-3 px-3 flex items-center justify-center text-center cursor-pointer transition-all ${
              !isIncome
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <span className="text-[13.5px] sm:text-[14px] leading-tight">
              Deduction Breakdown
            </span>
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
            <span className="text-[11px] font-extrabold text-[#17211D] flex items-center gap-1">
              <span>Total:</span>
              <BDT
                amount={isIncome ? gross : deduction}
                symbolClassName="text-[1.18em] font-black text-[#17211D] mr-0.5"
              />
            </span>
          </div>

          <div className="flex flex-col divide-y divide-[#F0F4F2]">
            {(isIncome ? incomeEntries : deductionEntries).map(([key, value]) => {
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
                    <BDT
                      amount={numVal}
                      symbolClassName={`text-[1.18em] font-black mr-0.5 ${
                        isIncome ? 'text-[#17211D]' : 'text-[#D83B3B]'
                      }`}
                    />
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

        {/* ========================================================================= */}
        {/* NEW SECTION 1: GRAPHICAL INTERFACE FOR EARNING & DEDUCTION COMPONENTS     */}
        {/* ========================================================================= */}
        <div
          id="graphical-breakdown-section"
          className="w-full bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3.5"
        >
          {/* Section Header with Graph Switcher */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E4ECE8]">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  graphTab === 'income'
                    ? 'bg-[#E9F7F1] text-[#008F5B]'
                    : 'bg-[#FDF2F2] text-[#D83B3B]'
                }`}
              >
                <BarChart3 size={17} />
              </div>
              <div>
                <h2 className="text-[13.5px] font-black text-[#17211D] leading-tight">
                  Visual Component Graph
                </h2>
                <span className="text-[10px] text-[#6E7974] font-medium block">
                  Proportional share & analytics
                </span>
              </div>
            </div>

            {/* Quick mini switcher for graph view */}
            <div className="flex items-center bg-[#F0F4F2] p-0.5 rounded-lg border border-[#E4ECE8]">
              <button
                type="button"
                onClick={() => setGraphTab('income')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  graphTab === 'income'
                    ? 'bg-white text-[#008F5B] shadow-2xs'
                    : 'text-[#6E7974] hover:text-[#17211D]'
                }`}
              >
                <PlusCircle size={10} />
                <span>Earnings</span>
              </button>
              <button
                type="button"
                onClick={() => setGraphTab('deduction')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                  graphTab === 'deduction'
                    ? 'bg-white text-[#D83B3B] shadow-2xs'
                    : 'text-[#6E7974] hover:text-[#17211D]'
                }`}
              >
                <MinusCircle size={10} />
                <span>Deductions</span>
              </button>
            </div>
          </div>

          {/* Graphical Representation */}
          {graphTab === 'income' ? (
            /* --- 1. EARNING COMPONENTS GRAPHICAL INTERFACE --- */
            <div className="flex flex-col gap-3.5">
              {/* Stacked Proportional Distribution Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-[#6E7974]">
                  <span>Earnings Distribution</span>
                  <span className="text-[#008F5B] font-extrabold flex items-center gap-1">
                    <span>Gross:</span>
                    <BDT amount={gross} symbolClassName="text-[1.18em] font-black text-[#008F5B] mr-0.5" />
                  </span>
                </div>

                <div className="w-full h-3.5 rounded-full bg-[#EBF2EE] overflow-hidden flex shadow-inner">
                  {incomeEntries.map(([key, val], idx) => {
                    const pct = gross > 0 ? (val / gross) * 100 : 0;
                    if (pct <= 0) return null;
                    const color = incomeColors[idx % incomeColors.length];
                    return (
                      <div
                        key={`stacked-inc-${key}`}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                        className="h-full first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all cursor-default"
                        title={`${key}: ${formatBDT(val)} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Individual Item Graphical Progress Bars */}
              <div className="flex flex-col gap-2.5 pt-1">
                {incomeEntries.map(([key, val], idx) => {
                  const pct = gross > 0 ? (val / gross) * 100 : 0;
                  const color = incomeColors[idx % incomeColors.length];

                  return (
                    <div
                      key={`graph-inc-${key}`}
                      className="p-2.5 rounded-xl bg-[#F9FCFA] border border-[#E4ECE8] hover:border-[#008F5B]/30 transition-all flex flex-col gap-1.5"
                    >
                      {/* Name, Percentage Badge & Amount */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: color }}
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          />
                          <span className="text-[12px] font-bold text-[#17211D]">{key}</span>
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-[#E9F7F1] text-[#008F5B] border border-[#008F5B]/15">
                            {pct.toFixed(1)}%
                          </span>
                        </div>

                        <strong className="text-[12.5px] font-black text-[#17211D]">
                          <BDT amount={val} symbolClassName="text-[1.18em] font-black text-[#17211D] mr-0.5" />
                        </strong>
                      </div>

                      {/* Visual Gradient Bar */}
                      <div className="w-full h-2 rounded-full bg-[#EAEFEA] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, pct)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          style={{ backgroundColor: color }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            /* --- 2. DEDUCTION COMPONENTS GRAPHICAL INTERFACE --- */
            <div className="flex flex-col gap-3.5">
              {/* Stacked Proportional Distribution Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-[#6E7974]">
                  <span>Deduction Distribution</span>
                  <span className="text-[#D83B3B] font-extrabold flex items-center gap-1">
                    <span>Total:</span>
                    <BDT amount={deduction} symbolClassName="text-[1.18em] font-black text-[#D83B3B] mr-0.5" />
                  </span>
                </div>

                <div className="w-full h-3.5 rounded-full bg-[#FBF0F0] overflow-hidden flex shadow-inner">
                  {deductionEntries.map(([key, val], idx) => {
                    const pct = deduction > 0 ? (val / deduction) * 100 : 0;
                    if (pct <= 0) return null;
                    const color = deductionColors[idx % deductionColors.length];
                    return (
                      <div
                        key={`stacked-ded-${key}`}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                        className="h-full first:rounded-l-full last:rounded-r-full hover:brightness-110 transition-all cursor-default"
                        title={`${key}: ${formatBDT(val)} (${pct.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Individual Item Graphical Progress Bars */}
              <div className="flex flex-col gap-2.5 pt-1">
                {deductionEntries.map(([key, val], idx) => {
                  const pct = deduction > 0 ? (val / deduction) * 100 : 0;
                  const color = deductionColors[idx % deductionColors.length];

                  return (
                    <div
                      key={`graph-ded-${key}`}
                      className="p-2.5 rounded-xl bg-[#FDFBFB] border border-[#E4ECE8] hover:border-[#D83B3B]/30 transition-all flex flex-col gap-1.5"
                    >
                      {/* Name, Percentage Badge & Amount */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: color }}
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          />
                          <span className="text-[12px] font-bold text-[#17211D]">{key}</span>
                          <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-[#FDF2F2] text-[#D83B3B] border border-[#D83B3B]/15">
                            {pct.toFixed(1)}%
                          </span>
                        </div>

                        <strong className="text-[12.5px] font-black text-[#D83B3B]">
                          <BDT amount={val} symbolClassName="text-[1.18em] font-black text-[#D83B3B] mr-0.5" />
                        </strong>
                      </div>

                      {/* Visual Gradient Bar */}
                      <div className="w-full h-2 rounded-full bg-[#FAECEC] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(4, pct)}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          style={{ backgroundColor: color }}
                          className="h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* NEW SECTION 2: SHORT COMPARISON & FULL COMPARISON LINK                    */}
        {/* ========================================================================= */}
        <div
          id="short-comparison-section"
          className="w-full bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE8]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                <ArrowUpDown size={16} />
              </div>
              <div>
                <h2 className="text-[13.5px] font-black text-[#17211D] leading-tight">
                  Month Comparison
                </h2>
                <span className="text-[10px] text-[#6E7974] font-medium block">
                  {previousRecord
                    ? `${record.monthLabel.split(' ')[0]} vs ${previousRecord.monthLabel.split(' ')[0]}`
                    : 'Latest trend analysis'}
                </span>
              </div>
            </div>
          </div>

          {/* 3 Micro Comparison Stats */}
          {previousRecord ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {/* Net Stat */}
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F5FAF7] border border-[#008F5B]/30 shadow-[0_2px_8px_rgba(0,143,91,0.04)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Net/Wallet) - Top Right like KPI cards */}
                <div className="absolute top-1.5 right-1.5 text-[#008F5B]/[0.08] group-hover:text-[#008F5B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <Wallet size={32} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#008F5B] uppercase tracking-wider block leading-tight">
                    Net Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      netDiff >= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    <BDT
                      amount={netDiff}
                      prefix={netDiff >= 0 ? '+' : ''}
                      decimals={2}
                      symbolClassName="text-[1.15em] font-black mr-0.5"
                    />
                  </strong>

                  {/* Dynamic Month label for previous month with .00 cleanly fitted on 390dp */}
                  <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#6E7974] font-bold shrink-0">
                      {(previousRecord?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                    </span>
                    <BDT
                      amount={previousRecord.net}
                      decimals={2}
                      symbolClassName="text-[1.12em] font-extrabold text-[#17211D] mr-0.5"
                      className="font-bold text-[#17211D]"
                    />
                  </div>
                </div>
              </div>

              {/* Gross Stat */}
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F6FAF8] border border-[#D8E6DF] shadow-[0_2px_8px_rgba(23,33,29,0.03)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Gross/Layers) - Top Right like KPI cards */}
                <div className="absolute top-1.5 right-1.5 text-[#17211D]/[0.07] group-hover:text-[#008F5B]/[0.12] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <Layers size={32} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#5C6E66] uppercase tracking-wider block leading-tight">
                    Gross Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      grossDiff >= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    <BDT
                      amount={grossDiff}
                      prefix={grossDiff >= 0 ? '+' : ''}
                      decimals={2}
                      symbolClassName="text-[1.15em] font-black mr-0.5"
                    />
                  </strong>

                  {/* Dynamic Month label for previous month with .00 cleanly fitted on 390dp */}
                  <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#6E7974] font-bold shrink-0">
                      {(previousRecord?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                    </span>
                    <BDT
                      amount={previousRecord.gross}
                      decimals={2}
                      symbolClassName="text-[1.12em] font-extrabold text-[#17211D] mr-0.5"
                      className="font-bold text-[#17211D]"
                    />
                  </div>
                </div>
              </div>

              {/* Deduction Stat */}
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FFF6F6] border border-[#FDCFD4] shadow-[0_2px_8px_rgba(216,59,59,0.03)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Deduction/ShieldAlert) - Top Right like KPI cards */}
                <div className="absolute top-1.5 right-1.5 text-[#D83B3B]/[0.08] group-hover:text-[#D83B3B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <ShieldAlert size={32} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#D83B3B] uppercase tracking-wider block leading-tight">
                    Deduct Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      dedDiff <= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    <BDT
                      amount={dedDiff}
                      prefix={dedDiff >= 0 ? '+' : ''}
                      decimals={2}
                      symbolClassName="text-[1.15em] font-black mr-0.5"
                    />
                  </strong>

                  {/* Dynamic Month label for previous month with .00 cleanly fitted on 390dp */}
                  <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#8A1A1A] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#D83B3B]/80 font-bold shrink-0">
                      {(previousRecord?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                    </span>
                    <BDT
                      amount={previousRecord.deduction}
                      decimals={2}
                      symbolClassName="text-[1.12em] font-extrabold text-[#D83B3B] mr-0.5"
                      className="font-bold text-[#D83B3B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-[#6E7974] text-center py-2">
              No previous month records found for direct comparison.
            </div>
          )}

          {/* Action Link to Full Comparison View */}
          <button
            type="button"
            id="open-full-comparison-btn"
            onClick={() => onNavigate('comparison')}
            className="w-full mt-1 p-3 rounded-xl bg-gradient-to-r from-[#008F5B] to-[#00A86B] hover:from-[#007A4D] hover:to-[#008F5B] text-white flex items-center justify-between shadow-[0_4px_16px_rgba(0,143,91,0.2)] hover:shadow-[0_6px_20px_rgba(0,143,91,0.3)] transition-all cursor-pointer active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <strong className="block text-[12.5px] font-black text-white leading-tight">
                  Full Salary Comparison
                </strong>
                <span className="text-[10px] text-white/80 block leading-tight">
                  Item-by-item breakdown & swap months
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-black text-white bg-white/15 px-2.5 py-1.5 rounded-lg group-hover:bg-white/25 transition-all">
              <span>Compare</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Danger Zone: Delete Entry Option */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFF5F5] to-[#FFEEED] border border-[#FDCFD4] flex flex-col gap-3 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F0] border border-[#FCD4D4] flex items-center justify-center text-[#D83B3B] shrink-0">
                <Trash2 size={16} />
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold text-[#17211D] leading-tight">
                  Delete {record.monthLabel} Entry
                </h4>
                <span className="text-[10.5px] text-[#7A8A83] font-medium block mt-0.5 leading-tight">
                  Permanently remove this salary record from your history
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="bottom-delete-record-btn"
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FFF0F0] text-[#D83B3B] hover:text-[#B52525] border border-[#FCD4D4] hover:border-[#D83B3B]/40 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99] cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete this Salary Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};

