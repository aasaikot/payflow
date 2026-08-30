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

  // Recent 3 records for quick preview
  const recentThree = salaryRecords.slice(0, 3);

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
        {/* Compact & Ultra-Modern Executive Hero Card (Optimized for all screen sizes) */}
        <motion.div
          id="hero-salary-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full rounded-[22px] bg-gradient-to-br from-[#021811] via-[#05291E] to-[#0A3D2D] p-4 sm:p-5 text-white shadow-[0_16px_35px_rgba(2,24,17,0.3)] border border-emerald-400/25 relative overflow-hidden transition-all duration-300 group"
        >
          {/* Animated Ambient Background Glows */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.18, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-emerald-400 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.06, 0.14, 0.06],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-[#00FF9D] blur-2xl pointer-events-none"
          />

          {/* Shimmer Light Sweep */}
          <motion.div
            initial={{ x: '-150%' }}
            animate={{ x: '250%' }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
              repeatDelay: 2.5,
            }}
            className="absolute top-0 bottom-0 w-28 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none"
          />

          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent pointer-events-none" />

          {/* Top Row: Company Name (Wrapped & Fully Visible) & Verified Badge */}
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="flex items-start gap-1.5 min-w-0 flex-1">
              <Building2 size={13} className="text-[#00FF9D] shrink-0 mt-0.5" />
              <span className="text-[10px] sm:text-[10.5px] font-black tracking-[0.14em] text-emerald-300/90 uppercase leading-snug drop-shadow-xs break-words">
                {userProfile.companyName}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-emerald-400/30 text-[9px] font-bold text-emerald-200 shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF9D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF9D]"></span>
              </span>
              <ShieldCheck size={10} className="text-[#00FF9D]" />
              <span className="tracking-wider uppercase">VERIFIED</span>
            </div>
          </div>

          {/* Sequence 1: Name (ASIF ARMAN SAIKOT) */}
          <div className="mt-3.5 relative z-10 flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] sm:text-[18.5px] font-black text-white tracking-tight leading-tight uppercase drop-shadow-sm">
                {userProfile.name}
              </h2>
              <BadgeCheck size={16} className="text-[#00FF9D] shrink-0 drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" />
            </div>

            {/* Sequence 2: Designation (Assistant Engineering Officer) */}
            <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-100/80 font-medium">
              <Briefcase size={11} className="text-[#00FF9D]/85 shrink-0" />
              <span>{userProfile.designation}</span>
            </div>

            {/* Sequence 3: PIN (5556) */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-200/90 font-semibold mt-0.5">
              <KeyRound size={10} className="text-[#00FF9D]/85 shrink-0" />
              <span>{userProfile.pin}</span>
            </div>
          </div>

          {/* Sequence 4: NET SALARY Label & Value */}
          <div className="mt-3 relative z-10 flex flex-col">
            <div className="flex items-center gap-1.5">
              <Wallet size={11} className="text-emerald-300" />
              <span className="text-[9.5px] font-black text-emerald-300/85 uppercase tracking-[0.2em]">
                NET SALARY
              </span>
              <button
                type="button"
                onClick={() => setIsAmountMasked(!isAmountMasked)}
                className="text-emerald-200/60 hover:text-white transition-colors cursor-pointer p-0.5 active:scale-90 ml-0.5"
                title={isAmountMasked ? 'Show amount' : 'Hide amount'}
              >
                {isAmountMasked ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>

            <motion.div
              key={net}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5"
            >
              <strong className="block text-[21px] sm:text-[23px] font-black text-white leading-none tracking-tight drop-shadow-md">
                {maskValue(formatBDT(net))}
              </strong>
            </motion.div>
          </div>

          {/* Sequence 5: MONTH OF AUGUST 2026 bottom center (small font & uppercase) */}
          <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8.5px] sm:text-[9px] font-bold tracking-[0.22em] text-emerald-200/90 uppercase text-center">
              <Calendar size={10} className="text-[#00FF9D] shrink-0" />
              <span>MONTH OF {activeRecord.monthLabel.toUpperCase()}</span>
            </div>
          </div>
        </motion.div>

        {/* Process Flow Visualizer: Gross ➔ Deductions ➔ Net Take-Home */}
        <div
          id="salary-process-flow-card"
          className="w-full bg-white rounded-[22px] p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
                <span className="text-[10px] text-[#6E7974] font-medium">Net Take-Home</span>
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
            className="p-3 rounded-[20px] bg-gradient-to-b from-white to-[#F6FAF8] border border-[#E0ECE6] shadow-[0_2px_10px_rgba(23,33,29,0.03)] hover:shadow-md hover:border-[#008F5B]/30 hover:bg-[#F2F9F5] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group"
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
            className="p-3 rounded-[20px] bg-gradient-to-b from-white to-[#FFF6F6] border border-[#F5D8D8] shadow-[0_2px_10px_rgba(216,59,59,0.03)] hover:shadow-md hover:border-[#D83B3B]/40 hover:bg-[#FDF0F0] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group"
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
            className="p-3 rounded-[20px] bg-gradient-to-b from-[#E9F7F1] to-[#D8F3E5] border border-[#008F5B]/35 shadow-[0_4px_14px_rgba(0,143,91,0.08)] hover:shadow-md hover:border-[#008F5B]/60 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group ring-1 ring-[#008F5B]/20"
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
                Take-Home Pay
              </span>
            </div>
          </button>
        </div>

        {/* Income vs Deduction Interactive Donut & Visual Card */}
        <div
          id="income-vs-deduction-card"
          className="w-full bg-white rounded-[24px] p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8]/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B] shadow-xs shadow-[#008F5B]/30 shrink-0" />
                  <span className="text-[11.5px] font-semibold text-[#17211D] truncate">Income</span>
                </div>
                <strong className="text-[12.5px] font-extrabold text-[#17211D] whitespace-nowrap shrink-0">
                  {maskValue(formatBDT(gross))}
                </strong>
              </div>

              {/* Deduction Row */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FFF5F5] border border-[#FFECEC]">
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
          className="w-full bg-white rounded-[24px] p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
            {/* June */}
            <div className="p-2 sm:p-2.5 rounded-[16px] bg-[#F5FAF7] border border-[#E4ECE8] text-center hover:shadow-xs transition-all">
              <span className="text-[8.5px] sm:text-[9px] font-bold text-[#6E7974] uppercase tracking-wider block">
                JUNE
              </span>
              <strong className="text-[11px] sm:text-[12px] font-extrabold text-[#17211D] block mt-0.5 whitespace-nowrap">
                {maskValue(formatBDT(78500))}
              </strong>
              <span className="text-[8.5px] sm:text-[9px] text-[#008F5B] font-bold block mt-0.5">
                +2.1% vs May
              </span>
              <div className="h-3.5 flex items-center justify-center mt-1">
                <svg className="w-full h-3 text-[#008F5B]" viewBox="0 0 50 15">
                  <path
                    d="M 0,12 L 15,8 L 30,10 L 48,2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* July */}
            <div className="p-2 sm:p-2.5 rounded-[16px] bg-[#F5FAF7] border border-[#E4ECE8] text-center hover:shadow-xs transition-all">
              <span className="text-[8.5px] sm:text-[9px] font-bold text-[#6E7974] uppercase tracking-wider block">
                JULY
              </span>
              <strong className="text-[11px] sm:text-[12px] font-extrabold text-[#17211D] block mt-0.5 whitespace-nowrap">
                {maskValue(formatBDT(79000))}
              </strong>
              <span className="text-[8.5px] sm:text-[9px] text-[#008F5B] font-bold block mt-0.5">
                +0.6% vs Jun
              </span>
              <div className="h-3.5 flex items-center justify-center mt-1">
                <svg className="w-full h-3 text-[#008F5B]" viewBox="0 0 50 15">
                  <path
                    d="M 0,10 L 18,12 L 32,6 L 48,3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* August (Current Highlight) */}
            <div className="p-2 sm:p-2.5 rounded-[16px] bg-gradient-to-b from-[#E9F7F1] to-[#DCF5E9] border border-[#008F5B]/40 text-center shadow-xs shadow-[#008F5B]/10">
              <span className="text-[8.5px] sm:text-[9px] font-extrabold text-[#008F5B] uppercase tracking-wider block">
                AUGUST
              </span>
              <strong className="text-[11px] sm:text-[12px] font-black text-[#008F5B] block mt-0.5 whitespace-nowrap">
                {maskValue(formatBDT(85256))}
              </strong>
              <span className="text-[8.5px] sm:text-[9px] text-[#008F5B] font-extrabold block mt-0.5">
                +7.9% vs Jul
              </span>
              <div className="h-3.5 flex items-center justify-center mt-1">
                <svg className="w-full h-3 text-[#008F5B]" viewBox="0 0 50 15">
                  <path
                    d="M 0,14 L 16,9 L 34,7 L 48,1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Last 3 Salary History (3-Column Layout Matching Salary Growth & Trend) */}
        <div
          id="last-three-history-card"
          className="w-full bg-white rounded-[24px] p-4 sm:p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
              const isLatest = idx === 0;
              const isSecond = idx === 1;

              // Sparklines and Growth Badges
              const growthText = isLatest ? '+7.9% vs Jul' : isSecond ? '+0.6% vs Jun' : '+2.1% vs May';
              const sparklinePath = isLatest
                ? 'M 0,14 L 16,9 L 34,7 L 48,1'
                : isSecond
                ? 'M 0,10 L 18,12 L 32,6 L 48,3'
                : 'M 0,12 L 15,8 L 30,10 L 48,2';

              return (
                <button
                  key={rec.month}
                  type="button"
                  onClick={() => {
                    onSelectMonth(rec.month);
                    onNavigate('details');
                  }}
                  className={`p-2 sm:p-2.5 rounded-[18px] text-center transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isLatest
                      ? 'bg-gradient-to-b from-[#E9F7F1] to-[#DCF5E9] border border-[#008F5B]/40 shadow-xs shadow-[#008F5B]/10 hover:shadow-md'
                      : 'bg-[#F5FAF7] border border-[#E4ECE8] hover:border-[#008F5B]/30 hover:bg-[#EBF5F0]'
                  }`}
                >
                  <span
                    className={`text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider block truncate ${
                      isLatest ? 'text-[#008F5B]' : 'text-[#6E7974]'
                    }`}
                  >
                    {rec.monthLabel.toUpperCase()}
                  </span>

                  <strong
                    className={`text-[11px] sm:text-[12px] font-black block mt-0.5 whitespace-nowrap tracking-tight ${
                      isLatest ? 'text-[#008F5B]' : 'text-[#17211D]'
                    }`}
                  >
                    {maskValue(formatBDT(rec.net))}
                  </strong>

                  <span
                    className={`text-[8.5px] sm:text-[9px] font-bold block mt-0.5 truncate ${
                      isLatest ? 'text-[#008F5B]' : 'text-[#6E7974]'
                    }`}
                  >
                    {growthText}
                  </span>

                  {/* Micro Visual Chart Effect */}
                  <div className="h-3.5 flex items-center justify-center mt-1">
                    <svg
                      className={`w-full h-3 ${isLatest ? 'text-[#008F5B]' : 'text-[#008F5B]/70'}`}
                      viewBox="0 0 50 15"
                    >
                      <path
                        d={sparklinePath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={isLatest ? '2.5' : '2'}
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
