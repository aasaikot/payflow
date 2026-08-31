import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  Download,
  Share2,
  Sparkles,
  Layers,
  CheckCircle2,
  PieChart as PieIcon,
  Activity,
  Calendar,
  Building2,
  User,
  Briefcase,
  KeyRound,
  BadgeCheck,
  Wallet,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MonthSalaryRecord, UserProfileData, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface DashboardViewProps {
  userProfile: UserProfileData;
  salaryRecords: MonthSalaryRecord[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  salaryRecords,
  activeMonth,
  onSelectMonth,
  onNavigate,
}) => {
  const [isAmountMasked, setIsAmountMasked] = useState(false);
  const [chartTab, setChartTab] = useState<'donut' | 'growth'>('donut');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeRecord =
    salaryRecords.find((r) => r.month === activeMonth) || salaryRecords[0];

  const gross = activeRecord?.gross || 0;
  const deduction = activeRecord?.deduction || 0;
  const net = activeRecord?.net || 0;
  const incomePercentage = gross > 0 ? Math.round((net / gross) * 100) : 67;
  const deductionPercentage = 100 - incomePercentage;

  // Previous month for growth calculation
  const currentIndex = salaryRecords.findIndex((r) => r.month === activeMonth);
  const prevRecord =
    currentIndex < salaryRecords.length - 1
      ? salaryRecords[currentIndex + 1]
      : null;
  const netGrowth = prevRecord ? net - prevRecord.net : 6256;
  const growthPercent = prevRecord && prevRecord.net > 0
    ? ((netGrowth / prevRecord.net) * 100).toFixed(1)
    : '7.9';

  const handleDownloadSlip = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const maskValue = (formatted: string) => {
    if (!isAmountMasked) return formatted;
    return '৳••••••';
  };

  // Recent 3 records for quick preview and trend visualization
  const recentThree = salaryRecords.slice(0, 3);
  const trendItems = [...recentThree].reverse().map((rec) => {
    const originalIdx = salaryRecords.findIndex((r) => r.month === rec.month);
    const prevRec = originalIdx < salaryRecords.length - 1 ? salaryRecords[originalIdx + 1] : null;
    let growthText = 'Baseline';
    let isPositive = true;
    if (prevRec && prevRec.net > 0) {
      const diff = rec.net - prevRec.net;
      const pct = ((diff / prevRec.net) * 100).toFixed(1);
      const prevMonthShort = prevRec.monthLabel.split(' ')[0].slice(0, 3);
      isPositive = Number(pct) >= 0;
      growthText = `${isPositive ? '+' : ''}${pct}% vs ${prevMonthShort}`;
    }
    return {
      ...rec,
      growthText,
      isPositive,
      isHighlighted: rec.month === activeMonth,
    };
  });

  return (
    <div id="dashboard-view-screen" className="w-full flex flex-col pb-8">
      {/* Top App Header with Glass Effect */}
      <div className="w-full flex items-center justify-between px-4 pt-3.5 pb-3 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8]/80 sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-[12px] bg-gradient-to-tr from-[#006B44] via-[#008F5B] to-[#00B873] text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-[#008F5B]/30">
            P
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-0.5">
              <span className="font-extrabold text-[17px] text-[#17211D] tracking-tight">Pay</span>
              <span className="font-extrabold text-[17px] text-[#008F5B] tracking-tight">Flow</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#008F5B] ml-1 animate-pulse" />
            </div>
            <span className="text-[10px] text-[#6E7974] font-medium -mt-0.5">
              Smart Payroll
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Amount Privacy Toggle */}
          <button
            type="button"
            id="toggle-mask-amount-btn"
            onClick={() => setIsAmountMasked(!isAmountMasked)}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#6E7974] hover:text-[#008F5B] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            title={isAmountMasked ? 'Show amounts' : 'Hide amounts'}
          >
            {isAmountMasked ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          {/* Notification Bell with Ping Dot */}
          <button
            type="button"
            id="notifications-bell-btn"
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] relative hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="w-2 h-2 bg-[#008F5B] rounded-full absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar with Emerald Glow Ring */}
          <button
            type="button"
            id="profile-avatar-btn"
            onClick={() => onNavigate('profile')}
            className="w-9 h-9 rounded-full ring-2 ring-[#008F5B] ring-offset-1 ring-offset-white overflow-hidden hover:scale-105 transition-all cursor-pointer shadow-xs"
            aria-label="Go to Profile"
          >
            <img
              src={userProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={userProfile.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Hero Card matching user reference design exactly */}
        <motion.div
          id="hero-salary-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full rounded-2xl bg-gradient-to-br from-[#DDF8EF] via-[#C9F3E4] to-[#5FD9B8] text-[#0E3B2E] shadow-[0_10px_28px_rgba(0,143,91,0.09)] border border-[#A4E4D2] relative overflow-hidden transition-all duration-300 flex flex-col"
        >
          {/* Smooth Background Decorative Curves & Ripple Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Soft Ambient Radial Glow on right */}
            <div className="absolute -right-6 -top-6 w-48 h-48 rounded-full bg-white/25 blur-2xl pointer-events-none" />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#34D399]/20 blur-xl pointer-events-none" />

            <svg
              className="absolute right-0 top-0 bottom-0 h-full w-[65%] pointer-events-none"
              viewBox="0 0 300 160"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Organic wave fills */}
              <path
                d="M100 0 C150 40 180 110 300 80 L300 160 L120 160 C60 130 50 40 100 0 Z"
                fill="url(#hero-wave-soft-1)"
                opacity="0.35"
              />
              <path
                d="M160 160 C210 100 240 60 300 20 L300 160 Z"
                fill="url(#hero-wave-soft-2)"
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
                <linearGradient id="hero-wave-soft-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="hero-wave-soft-2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Main Top Section: Left Info List | Dashed Line | Net Amount + Shield */}
          <div className="px-3.5 sm:px-4 pt-3.5 pb-3 flex items-center justify-between gap-2 relative z-10">
            {/* Left 4-item Info List (Expanded with abundant space for long names & designation) */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              {/* 1. Company */}
              <div className="flex items-start gap-2 text-[#0E3B2E] min-w-0">
                <Building2 size={14} className="text-[#0E3B2E] shrink-0 mt-0.5 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-snug break-words">
                  {userProfile.companyName || 'Tech Solutions Ltd.'}
                </span>
              </div>

              {/* 2. Employee Name */}
              <div className="flex items-start gap-2 text-[#0E3B2E] min-w-0">
                <User size={14} className="text-[#0E3B2E] shrink-0 mt-0.5 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-snug break-words">
                  {userProfile.name || 'Saikot Ahmed'}
                </span>
              </div>

              {/* 3. Designation */}
              <div className="flex items-start gap-2 text-[#0E3B2E] min-w-0">
                <Briefcase size={14} className="text-[#0E3B2E] shrink-0 mt-0.5 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-snug break-words">
                  {userProfile.designation || 'Software Engineer'}
                </span>
              </div>

              {/* 4. PIN */}
              <div className="flex items-center gap-2 text-[#0E3B2E] min-w-0">
                <ShieldCheck size={14} className="text-[#0E3B2E] shrink-0 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-none">
                  PIN: {userProfile.pin || userProfile.employeeId || '123456'}
                </span>
              </div>
            </div>

            {/* Dashed Vertical Divider */}
            <div className="h-16 w-[1px] border-r border-dashed border-[#3CAE90]/70 mx-1 shrink-0 self-center" />

            {/* Right Side: Clean NET AMOUNT Block with repositioned verified badge */}
            <div className="flex flex-col items-end justify-center shrink-0 pr-1">
              {/* Verified Pill Badge (Repositioned above NET AMOUNT) */}
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/40 border border-white/70 text-[8.5px] font-bold text-[#0E3B2E] shadow-2xs mb-1">
                <ShieldCheck size={10} className="text-[#059669]" />
                <span className="tracking-wide">VERIFIED</span>
              </div>

              {/* NET AMOUNT (Uppercase) with Mask toggle */}
              <div className="flex items-center justify-end gap-1 text-[#226352] text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase leading-none">
                <span>NET AMOUNT</span>
                <button
                  type="button"
                  onClick={() => setIsAmountMasked(!isAmountMasked)}
                  className="text-[#226352]/75 hover:text-[#0E3B2E] transition-colors cursor-pointer p-0.5"
                  title={isAmountMasked ? 'Show amount' : 'Hide amount'}
                >
                  {isAmountMasked ? <EyeOff size={10} /> : <Eye size={10} />}
                </button>
              </div>

              {/* Smaller Salary Font with .00 decimal format */}
              <motion.div
                key={net}
                initial={{ scale: 0.96, opacity: 0.9 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mt-0.5 text-right"
              >
                <strong className="block text-[13px] sm:text-[15px] font-bold text-[#08281F] leading-none tracking-tight whitespace-nowrap">
                  {isAmountMasked ? '••••••••' : formatBDT(net)}
                </strong>
              </motion.div>
            </div>
          </div>

          {/* Bottom Sub-Banner Ribbon: MONTH OF AUGUST 2026 (Smaller Font) */}
          <div className="w-full bg-[#B8EDDA]/80 border-t border-[#9FE0CE]/80 py-1 px-4 flex items-center justify-center text-center relative z-10">
            <span className="text-[8px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#1B5746] uppercase">
              MONTH OF {activeRecord.monthLabel.toUpperCase()}
            </span>
          </div>
        </motion.div>

        {/* Process Flow Visualizer: Gross ➔ Deductions ➔ Net Take-Home */}
        <div
          id="salary-process-flow-card"
          className="w-full bg-white rounded-xl p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <Activity size={14} className="text-[#008F5B]" />
              <h3 className="text-[13px] font-extrabold text-[#17211D]">
                Salary Cashflow & Distribution
              </h3>
            </div>
          </div>

          {/* Visual Step-Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#FFECEC] overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${incomePercentage}%` }}
              className="h-full bg-gradient-to-r from-[#007A4D] to-[#00A86B] rounded-l-full relative group cursor-pointer transition-all duration-500"
              title={`Net Salary: ${incomePercentage}%`}
            />
            <div
              style={{ width: `${deductionPercentage}%` }}
              className="h-full bg-gradient-to-r from-[#E11D48] to-[#D83B3B] rounded-r-full relative group cursor-pointer transition-all duration-500"
              title={`Deductions: ${deductionPercentage}%`}
            />
          </div>

          {/* Flow Legend Below */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#F0F4F2] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6E7974] font-medium">Net Amount</span>
                <strong className="text-[12px] font-bold text-[#008F5B]">
                  {maskValue(formatBDT(net))} ({incomePercentage}%)
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end text-right">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#6E7974] font-medium">Total Deductions</span>
                <strong className="text-[12px] font-bold text-[#D83B3B]">
                  {maskValue(formatBDT(deduction))} ({deductionPercentage}%)
                </strong>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B] shrink-0" />
            </div>
          </div>
        </div>

        {/* Brand New High-End 3-Card Layout for GROSS, DEDUCTION, NET */}
        <div
          id="kpi-metrics-cards"
          className="grid grid-cols-3 gap-2"
        >
          {/* GROSS */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-3 rounded-xl bg-gradient-to-b from-white to-[#F6FAF8] border border-[#E0ECE6] shadow-[0_2px_10px_rgba(23,33,29,0.03)] hover:shadow-md hover:border-[#008F5B]/30 hover:bg-[#F2F9F5] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-extrabold text-[#6E7974] uppercase tracking-wider">
                GROSS
              </span>
              <div className="w-5 h-5 rounded-lg bg-[#EBF4F0] text-[#17211D] flex items-center justify-center group-hover:bg-[#008F5B] group-hover:text-white transition-colors">
                <Layers size={11} />
              </div>
            </div>
            <div className="mt-2">
              <strong className="block text-[12.5px] sm:text-[13.5px] font-black text-[#17211D] tracking-tight truncate">
                {maskValue(formatBDT(gross))}
              </strong>
              <span className="text-[9.5px] text-[#008F5B] font-bold block mt-0.5">
                Total Earnings
              </span>
            </div>
          </button>

          {/* DEDUCTION */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-3 rounded-xl bg-gradient-to-b from-white to-[#FFF6F6] border border-[#F5D8D8] shadow-[0_2px_10px_rgba(216,59,59,0.03)] hover:shadow-md hover:border-[#D83B3B]/40 hover:bg-[#FDF0F0] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-extrabold text-[#D83B3B] uppercase tracking-wider">
                DEDUCTION
              </span>
              <div className="w-5 h-5 rounded-lg bg-[#FDE8E8] text-[#D83B3B] flex items-center justify-center group-hover:bg-[#D83B3B] group-hover:text-white transition-colors">
                <ShieldAlert size={11} />
              </div>
            </div>
            <div className="mt-2">
              <strong className="block text-[12.5px] sm:text-[13.5px] font-black text-[#D83B3B] tracking-tight truncate">
                {maskValue(formatBDT(deduction))}
              </strong>
              <span className="text-[9.5px] text-[#D83B3B]/80 font-bold block mt-0.5">
                Tax, PF & Cuts
              </span>
            </div>
          </button>

          {/* NET */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-3 rounded-xl bg-gradient-to-b from-[#E9F7F1] to-[#D8F3E5] border border-[#008F5B]/35 shadow-[0_4px_14px_rgba(0,143,91,0.08)] hover:shadow-md hover:border-[#008F5B]/60 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group ring-1 ring-[#008F5B]/20"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] font-black text-[#008F5B] uppercase tracking-wider">
                NET PAID
              </span>
              <div className="w-5 h-5 rounded-lg bg-[#008F5B] text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 size={11} />
              </div>
            </div>
            <div className="mt-2">
              <strong className="block text-[12.5px] sm:text-[13.5px] font-black text-[#008F5B] tracking-tight truncate">
                {maskValue(formatBDT(net))}
              </strong>
              <span className="text-[9.5px] text-[#008F5B] font-extrabold block mt-0.5">
                Net Payable
              </span>
            </div>
          </button>
        </div>

        {/* Income vs Deduction Interactive Donut & Visual Card */}
        <div
          id="income-vs-deduction-card"
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <PieIcon size={16} className="text-[#008F5B]" />
              <h3 className="text-[14px] font-extrabold text-[#17211D]">
                Income vs Deduction
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('details')}
              className="text-[11px] font-bold text-[#008F5B] hover:text-[#007A4D] cursor-pointer flex items-center gap-1 bg-[#E9F7F1] px-2.5 py-1 rounded-full hover:bg-[#D4EFE4] transition-colors"
            >
              <span>Full Details</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 sm:gap-4">
            {/* Left Legend & Values */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              {/* Income Row */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F5FAF7] border border-[#E4ECE8]/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B] shadow-xs shadow-[#008F5B]/30 shrink-0" />
                  <span className="text-[11.5px] font-semibold text-[#17211D] truncate">Income</span>
                </div>
                <strong className="text-[12.5px] font-extrabold text-[#17211D] whitespace-nowrap shrink-0">
                  {maskValue(formatBDT(gross))}
                </strong>
              </div>

              {/* Deduction Row */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FFF5F5] border border-[#FFECEC]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B] shadow-xs shadow-[#D83B3B]/30 shrink-0" />
                  <span className="text-[11.5px] font-semibold text-[#17211D] truncate">Deduction</span>
                </div>
                <strong className="text-[12.5px] font-extrabold text-[#D83B3B] whitespace-nowrap shrink-0">
                  {maskValue(formatBDT(deduction))}
                </strong>
              </div>
            </div>

            {/* Right Glowing Donut Graphic */}
            <div className="relative w-22 h-22 shrink-0 flex items-center justify-center">
              <svg className="w-22 h-22 transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-[#FFECEC]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Income Green Arc */}
                <path
                  className="text-[#008F5B] transition-all duration-700"
                  strokeDasharray={`${incomePercentage}, 100`}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-center">
                <span className="text-[13px] font-black text-[#17211D]">
                  {incomePercentage}%
                </span>
                <span className="text-[8px] text-[#6E7974] font-bold mt-0.5 uppercase">
                  Net Ratio
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Month Comparison Card with Dynamic Sparklines & Growth Flags */}
        <div
          id="month-comparison-preview-card"
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={16} className="text-[#008F5B]" />
              <h3 className="text-[14px] font-extrabold text-[#17211D]">
                Salary Growth & Trend
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('comparison')}
              className="text-[11px] font-bold text-[#008F5B] hover:underline cursor-pointer"
            >
              Full Comparison &gt;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {trendItems.map((item) => {
              const monthName = item.monthLabel.split(' ')[0].toUpperCase();
              const isSelected = item.month === activeMonth;

              return (
                <button
                  key={item.month}
                  type="button"
                  onClick={() => {
                    onSelectMonth(item.month);
                    onNavigate('details');
                  }}
                  className={`p-2 sm:p-2.5 rounded-lg text-center transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#E9F7F1] to-[#DCF5E9] border border-[#008F5B]/40 text-center shadow-xs shadow-[#008F5B]/10 hover:shadow-md'
                      : 'bg-[#F5FAF7] border border-[#E4ECE8] hover:border-[#008F5B]/30 hover:bg-[#EBF5F0]'
                  }`}
                >
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-extrabold uppercase tracking-wider block truncate ${
                      isSelected ? 'text-[#008F5B]' : 'text-[#6E7974]'
                    }`}
                  >
                    {monthName}
                  </span>
                  <strong
                    className={`text-[11px] sm:text-[12px] font-black block mt-0.5 whitespace-nowrap tracking-tight ${
                      isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                    }`}
                  >
                    {maskValue(formatBDT(item.net))}
                  </strong>
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-bold block mt-0.5 truncate ${
                      item.isPositive ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {item.growthText}
                  </span>
                  <div className="h-3.5 flex items-center justify-center mt-1">
                    <svg
                      className={`w-full h-3 ${item.isPositive ? 'text-[#008F5B]' : 'text-[#D83B3B]'}`}
                      viewBox="0 0 50 15"
                    >
                      <path
                        d={
                          item.isPositive
                            ? 'M 0,14 L 16,9 L 34,7 L 48,1'
                            : 'M 0,2 L 16,7 L 34,9 L 48,14'
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={isSelected ? '2.5' : '2'}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Last 3 Salary History (3-Column Layout Matching Salary Growth & Trend) */}
        <div
          id="last-three-history-card"
          className="w-full bg-white rounded-xl p-4 sm:p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-[#008F5B]" />
              <h3 className="text-[14px] font-extrabold text-[#17211D]">
                Last 3 Salary History
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-[11px] font-bold text-[#008F5B] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Full History</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {recentThree.map((rec, idx) => {
              const isSelected = rec.month === activeMonth;
              const originalIdx = salaryRecords.findIndex((r) => r.month === rec.month);
              const prevRec = originalIdx < salaryRecords.length - 1 ? salaryRecords[originalIdx + 1] : null;
              let growthText = 'Baseline';
              let isPositive = true;
              if (prevRec && prevRec.net > 0) {
                const diff = rec.net - prevRec.net;
                const pct = ((diff / prevRec.net) * 100).toFixed(1);
                const prevMonthShort = prevRec.monthLabel.split(' ')[0].slice(0, 3);
                isPositive = Number(pct) >= 0;
                growthText = `${isPositive ? '+' : ''}${pct}% vs ${prevMonthShort}`;
              }

              return (
                <button
                  key={rec.month}
                  type="button"
                  onClick={() => {
                    onSelectMonth(rec.month);
                    onNavigate('details');
                  }}
                  className={`p-2 sm:p-2.5 rounded-lg text-center transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#E9F7F1] to-[#DCF5E9] border border-[#008F5B]/40 shadow-xs shadow-[#008F5B]/10 hover:shadow-md'
                      : 'bg-[#F5FAF7] border border-[#E4ECE8] hover:border-[#008F5B]/30 hover:bg-[#EBF5F0]'
                  }`}
                >
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider block truncate ${
                      isSelected ? 'text-[#008F5B]' : 'text-[#6E7974]'
                    }`}
                  >
                    {rec.monthLabel.split(' ')[0].toUpperCase()}
                  </span>

                  <strong
                    className={`text-[11px] sm:text-[12px] font-black block mt-0.5 whitespace-nowrap tracking-tight ${
                      isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                    }`}
                  >
                    {maskValue(formatBDT(rec.net))}
                  </strong>

                  <span
                    className={`text-[8.5px] sm:text-[9px] font-bold block mt-0.5 truncate ${
                      isPositive ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {growthText}
                  </span>

                  {/* Micro Visual Chart Effect */}
                  <div className="h-3.5 flex items-center justify-center mt-1">
                    <svg
                      className={`w-full h-3 ${isPositive ? 'text-[#008F5B]' : 'text-[#D83B3B]'}`}
                      viewBox="0 0 50 15"
                    >
                      <path
                        d={
                          isPositive
                            ? 'M 0,14 L 16,9 L 34,7 L 48,1'
                            : 'M 0,2 L 16,7 L 34,9 L 48,14'
                        }
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={isSelected ? '2.5' : '2'}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
