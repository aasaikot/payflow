import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
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
  Landmark,
  CircleDollarSign,
  Zap,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { MonthSalaryRecord, UserProfileData, ScreenType } from '../types';
import { formatBDT } from '../mockData';
import { PayFlowTopBar } from './PayFlowTopBar';
import { NotificationModal, INITIAL_NOTIFICATIONS, NotificationItem } from './NotificationModal';
import { BDT } from './BDT';

const getMonthYearFull = (monthStr: string, monthLabel?: string): string => {
  if (monthLabel) {
    return monthLabel.toUpperCase();
  }
  if (monthStr && monthStr.includes('-')) {
    const [year, m] = monthStr.split('-');
    const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const mIdx = parseInt(m, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${monthNames[mIdx]} ${year}`;
    }
  }
  return monthStr;
};

interface DashboardViewProps {
  userProfile: UserProfileData;
  salaryRecords: MonthSalaryRecord[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onNavigate: (screen: ScreenType) => void;
  notifications?: NotificationItem[];
  onUpdateNotifications?: (updater: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  salaryRecords,
  activeMonth,
  onSelectMonth,
  onNavigate,
  notifications: propsNotifications,
  onUpdateNotifications,
}) => {
  const [isAmountMasked, setIsAmountMasked] = useState(false);
  const [chartTab, setChartTab] = useState<'donut' | 'growth'>('donut');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifications = propsNotifications || localNotifications;
  const setNotifications = onUpdateNotifications || setLocalNotifications;

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const activeRecord =
    salaryRecords.find((r) => r.month === activeMonth) || salaryRecords[0] || null;

  const hasRecords = salaryRecords.length > 0;
  const gross = activeRecord?.gross || 0;
  const deduction = activeRecord?.deduction || 0;
  const net = activeRecord?.net || 0;
  const incomePercentage = gross > 0 ? Math.round((net / gross) * 100) : hasRecords ? 0 : 0;
  const deductionPercentage = 100 - incomePercentage;

  // Previous month for growth calculation
  const currentIndex = activeRecord ? salaryRecords.findIndex((r) => r.month === activeMonth) : -1;
  const prevRecord =
    currentIndex !== -1 && currentIndex < salaryRecords.length - 1
      ? salaryRecords[currentIndex + 1]
      : null;
  const netGrowth = prevRecord ? net - prevRecord.net : 0;
  const growthPercent = prevRecord && prevRecord.net > 0
    ? ((netGrowth / prevRecord.net) * 100).toFixed(1)
    : '0.0';

  const handleDownloadSlip = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
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
      {/* Reusable Mobile PayFlow Top Navigation Bar (Concept 2: Personalized Greeting & Status Bar) */}
      <PayFlowTopBar
        userProfile={userProfile}
        activeMonthLabel={activeRecord?.monthLabel}
        unreadCount={unreadNotificationCount}
        onProfileClick={() => onNavigate('profile')}
        onNotificationClick={() => setIsNotificationOpen(true)}
        onMenuPressed={() => onNavigate('profile')}
      />

      {/* Notification Sheet / Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
        onNavigateToRecord={(recId) => {
          setIsNotificationOpen(false);
          if (recId) onSelectMonth(recId);
        }}
      />

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
                  {userProfile.companyName || 'PayFlow Workspace'}
                </span>
              </div>

              {/* 2. Employee Name */}
              <div className="flex items-start gap-2 text-[#0E3B2E] min-w-0">
                <User size={14} className="text-[#0E3B2E] shrink-0 mt-0.5 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-snug break-words">
                  {userProfile.name || userProfile.email?.split('@')[0] || 'Employee'}
                </span>
              </div>

              {/* 3. Designation */}
              <div className="flex items-start gap-2 text-[#0E3B2E] min-w-0">
                <Briefcase size={14} className="text-[#0E3B2E] shrink-0 mt-0.5 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-snug break-words">
                  {userProfile.designation || 'Staff Member'}
                </span>
              </div>

              {/* 4. PIN */}
              <div className="flex items-center gap-2 text-[#0E3B2E] min-w-0">
                <ShieldCheck size={14} className="text-[#0E3B2E] shrink-0 stroke-[1.8]" />
                <span className="text-[11.5px] sm:text-[12.5px] font-semibold text-[#0E3B2E] leading-none">
                  PIN: {userProfile.pin || userProfile.employeeId || '---'}
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
                <span className="tracking-wide">{hasRecords ? 'VERIFIED' : 'READY'}</span>
              </div>

              {/* NET AMOUNT (Uppercase) with Mask toggle */}
              <div className="flex items-center justify-end gap-1 text-[#226352] text-[9.5px] sm:text-[10.5px] font-bold tracking-wider uppercase leading-none">
                <span>NET AMOUNT</span>
                {hasRecords && (
                  <button
                    type="button"
                    onClick={() => setIsAmountMasked(!isAmountMasked)}
                    className="text-[#226352]/75 hover:text-[#0E3B2E] transition-colors cursor-pointer p-0.5"
                    title={isAmountMasked ? 'Show amount' : 'Hide amount'}
                  >
                    {isAmountMasked ? <EyeOff size={10} /> : <Eye size={10} />}
                  </button>
                )}
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
                  {hasRecords ? (
                    isAmountMasked ? (
                      '••••••••'
                    ) : (
                      <BDT
                        amount={net}
                        symbolClassName="text-[1.22em] font-black text-[#08281F] mr-0.5"
                      />
                    )
                  ) : (
                    <BDT
                      amount={0}
                      symbolClassName="text-[1.22em] font-black text-[#08281F] mr-0.5"
                    />
                  )}
                </strong>
              </motion.div>
            </div>
          </div>

          {/* Bottom Sub-Banner Ribbon: MONTH OF AUGUST 2026 (Smaller Font) */}
          <div className="w-full bg-[#B8EDDA]/80 border-t border-[#9FE0CE]/80 py-1 px-4 flex items-center justify-center text-center relative z-10">
            <span className="text-[8px] sm:text-[8.5px] font-bold tracking-[0.25em] text-[#1B5746] uppercase">
              {activeRecord?.monthLabel ? `MONTH OF ${activeRecord.monthLabel.toUpperCase()}` : 'NO SALARY ENTRIES YET'}
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
                <strong className="text-[12px] font-bold text-[#008F5B] flex items-center">
                  <BDT amount={net} symbolClassName="text-[1.18em] font-black text-[#008F5B] mr-0.5" />
                  <span className="ml-1">({incomePercentage}%)</span>
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end text-right">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-[#6E7974] font-medium">Total Deductions</span>
                <strong className="text-[12px] font-bold text-[#D83B3B] flex items-center justify-end">
                  <BDT amount={deduction} symbolClassName="text-[1.18em] font-black text-[#D83B3B] mr-0.5" />
                  <span className="ml-1">({deductionPercentage}%)</span>
                </strong>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B] shrink-0" />
            </div>
          </div>
        </div>

        {/* Brand New High-End 3-Card Layout for GROSS, DEDUCTION, NET with Watermark Icons */}
        <div
          id="kpi-metrics-cards"
          className="grid grid-cols-3 gap-1.5 sm:gap-2"
        >
          {/* GROSS */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-white to-[#F6FAF8] border border-[#E0ECE6] shadow-[0_2px_10px_rgba(23,33,29,0.03)] hover:shadow-md hover:border-[#008F5B]/30 hover:bg-[#F2F9F5] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden"
          >
            {/* Watermark Icon - Top Right Clean */}
            <div className="absolute top-2 right-2 text-[#17211D]/[0.06] group-hover:text-[#008F5B]/[0.12] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <Layers size={36} strokeWidth={1.5} />
            </div>

            <div className="w-full relative z-10">
              <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#6E7974] uppercase tracking-wider block">
                GROSS
              </span>
            </div>
            <div className="mt-1.5 relative z-10">
              <strong className="block text-[10px] sm:text-[12.5px] font-black text-[#17211D] tracking-tight whitespace-nowrap">
                <BDT amount={gross} symbolClassName="text-[1.18em] font-black text-[#17211D] mr-0.5" />
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-[#008F5B] font-bold block mt-0.5 whitespace-nowrap">
                Total Earnings
              </span>
            </div>
          </button>

          {/* DEDUCTION */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-white to-[#FFF6F6] border border-[#F5D8D8] shadow-[0_2px_10px_rgba(216,59,59,0.03)] hover:shadow-md hover:border-[#D83B3B]/40 hover:bg-[#FDF0F0] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden"
          >
            {/* Watermark Icon - Top Right Clean */}
            <div className="absolute top-2 right-2 text-[#D83B3B]/[0.08] group-hover:text-[#D83B3B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <ShieldAlert size={36} strokeWidth={1.5} />
            </div>

            <div className="w-full relative z-10">
              <span className="text-[9px] sm:text-[9.5px] font-extrabold text-[#D83B3B] uppercase tracking-wider block">
                DEDUCTION
              </span>
            </div>
            <div className="mt-1.5 relative z-10">
              <strong className="block text-[10px] sm:text-[12.5px] font-black text-[#D83B3B] tracking-tight whitespace-nowrap">
                <BDT amount={deduction} symbolClassName="text-[1.18em] font-black text-[#D83B3B] mr-0.5" />
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-[#D83B3B]/80 font-bold block mt-0.5 whitespace-nowrap">
                Tax, PF & Cuts
              </span>
            </div>
          </button>

          {/* NET */}
          <button
            type="button"
            onClick={() => onNavigate('details')}
            className="p-2 sm:p-3 rounded-xl bg-gradient-to-b from-[#E9F7F1] to-[#D8F3E5] border border-[#008F5B]/35 shadow-[0_4px_14px_rgba(0,143,91,0.08)] hover:shadow-md hover:border-[#008F5B]/60 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group ring-1 ring-[#008F5B]/20 relative overflow-hidden"
          >
            {/* Watermark Icon - Top Right Clean */}
            <div className="absolute top-2 right-2 text-[#008F5B]/[0.09] group-hover:text-[#008F5B]/[0.18] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <CheckCircle2 size={36} strokeWidth={1.5} />
            </div>

            <div className="w-full relative z-10">
              <span className="text-[9px] sm:text-[9.5px] font-black text-[#008F5B] uppercase tracking-wider block">
                NET PAID
              </span>
            </div>
            <div className="mt-1.5 relative z-10">
              <strong className="block text-[10px] sm:text-[12.5px] font-black text-[#008F5B] tracking-tight whitespace-nowrap">
                <BDT amount={net} symbolClassName="text-[1.18em] font-black text-[#008F5B] mr-0.5" />
              </strong>
              <span className="text-[8.5px] sm:text-[9.5px] text-[#008F5B] font-extrabold block mt-0.5 whitespace-nowrap">
                Net Payable
              </span>
            </div>
          </button>
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
            {hasRecords && (
              <button
                type="button"
                onClick={() => onNavigate('comparison')}
                className="text-[11px] font-bold text-[#008F5B] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Full Comparison</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {hasRecords ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {trendItems.map((item, idx) => {
                const fullMonth = getMonthYearFull(item.month, item.monthLabel);
                const isSelected = item.month === activeMonth;

                return (
                  <button
                    key={item.month}
                    type="button"
                    onClick={() => {
                      onSelectMonth(item.month);
                      onNavigate('comparison');
                    }}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#E9F7F1] to-[#DCF5E9] border border-[#008F5B]/40 shadow-[0_4px_14px_rgba(0,143,91,0.08)] ring-1 ring-[#008F5B]/20 hover:shadow-md scale-[1.01]'
                        : 'bg-gradient-to-b from-white to-[#F8FCFA] border border-[#E0ECE6] shadow-[0_2px_8px_rgba(23,33,29,0.02)] hover:border-[#008F5B]/30 hover:bg-[#F2F9F5] hover:shadow-sm'
                    }`}
                  >
                    {/* Top Row: Full Month Name (e.g. JUNE 2026, JULY 2026) */}
                    <div className="w-full flex items-center justify-between relative z-10">
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-tight leading-tight block truncate ${
                          isSelected ? 'text-[#008F5B]' : 'text-[#6E7974]'
                        }`}
                        title={fullMonth}
                      >
                        {fullMonth}
                      </span>
                    </div>

                    {/* Middle: Net Salary Amount (Full formatBDT with .00 decimals, fitted font) */}
                    <div className="mt-1.5 mb-1 relative z-10">
                      <strong
                        className={`block text-[9.5px] sm:text-[11.5px] font-black tracking-tight leading-tight ${
                          isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                        }`}
                      >
                        <BDT
                          amount={item.net}
                          symbolClassName={`text-[1.18em] font-black mr-0.5 ${
                            isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                          }`}
                        />
                      </strong>
                      <span className="text-[8px] sm:text-[8.5px] text-[#8A9791] font-semibold block leading-tight mt-0.5">
                        Net Take-Home
                      </span>
                    </div>

                    {/* Graphical Micro Area Sparkline with Curved Flow & Multi-Color Point Dots */}
                    <div className="w-full h-7 relative z-10 mt-1">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 80 26"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id={`trend-gradient-${item.month}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor={
                                item.growthText === 'Baseline'
                                  ? '#008F5B'
                                  : item.isPositive
                                  ? '#008F5B'
                                  : '#D83B3B'
                              }
                              stopOpacity="0.28"
                            />
                            <stop
                              offset="100%"
                              stopColor={
                                item.growthText === 'Baseline'
                                  ? '#008F5B'
                                  : item.isPositive
                                  ? '#008F5B'
                                  : '#D83B3B'
                              }
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Subtle baseline reference line */}
                        <line
                          x1="0"
                          y1="23"
                          x2="80"
                          y2="23"
                          stroke="#E6EFEA"
                          strokeWidth="0.75"
                          strokeDasharray="2,2"
                        />

                        {/* Area Gradient Fill */}
                        <path
                          d={
                            item.growthText === 'Baseline'
                              ? 'M 0,16 C 24,14 54,12 80,10 L 80,24 L 0,24 Z'
                              : item.isPositive
                              ? 'M 0,20 C 26,18 52,9 80,4 L 80,24 L 0,24 Z'
                              : 'M 0,6 C 26,11 52,17 80,21 L 80,24 L 0,24 Z'
                          }
                          fill={`url(#trend-gradient-${item.month})`}
                        />

                        {/* Curve Stroke Line */}
                        <path
                          d={
                            item.growthText === 'Baseline'
                              ? 'M 0,16 C 24,14 54,12 80,10'
                              : item.isPositive
                              ? 'M 0,20 C 26,18 52,9 80,4'
                              : 'M 0,6 C 26,11 52,17 80,21'
                          }
                          fill="none"
                          stroke={
                            item.growthText === 'Baseline'
                              ? '#008F5B'
                              : item.isPositive
                              ? '#008F5B'
                              : '#D83B3B'
                          }
                          strokeWidth={isSelected ? '2' : '1.75'}
                          strokeLinecap="round"
                        />

                        {/* Multi-Color Point Dots along the Curve */}
                        {item.growthText === 'Baseline' ? (
                          <>
                            <circle cx="2" cy="16" r="2" fill="#0284C7" stroke="white" strokeWidth="0.8" />
                            <circle cx="27" cy="14" r="2" fill="#8B5CF6" stroke="white" strokeWidth="0.8" />
                            <circle cx="54" cy="12" r="2" fill="#F59E0B" stroke="white" strokeWidth="0.8" />
                            <circle cx="78" cy="10" r="2.6" fill="#008F5B" stroke="white" strokeWidth="1" />
                          </>
                        ) : item.isPositive ? (
                          <>
                            <circle cx="2" cy="20" r="2" fill="#F59E0B" stroke="white" strokeWidth="0.8" />
                            <circle cx="27" cy="17" r="2" fill="#0284C7" stroke="white" strokeWidth="0.8" />
                            <circle cx="54" cy="10" r="2" fill="#8B5CF6" stroke="white" strokeWidth="0.8" />
                            <circle cx="78" cy="4" r="2.6" fill="#008F5B" stroke="white" strokeWidth="1" />
                          </>
                        ) : (
                          <>
                            <circle cx="2" cy="6" r="2" fill="#0284C7" stroke="white" strokeWidth="0.8" />
                            <circle cx="27" cy="11" r="2" fill="#8B5CF6" stroke="white" strokeWidth="0.8" />
                            <circle cx="54" cy="17" r="2" fill="#F59E0B" stroke="white" strokeWidth="0.8" />
                            <circle cx="78" cy="21" r="2.6" fill="#D83B3B" stroke="white" strokeWidth="1" />
                          </>
                        )}
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center px-4 bg-[#F5FAF7] rounded-xl border border-dashed border-[#D1E5DC]">
              <Calendar size={28} className="text-[#8A9791] mb-2" />
              <p className="text-xs font-semibold text-[#17211D]">No salary trends recorded</p>
              <p className="text-[11px] text-[#6E7974] mt-0.5 max-w-xs">
                Add your monthly salary slips to see interactive salary trends and comparisons.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="mt-3 px-3 py-1.5 bg-[#008F5B] text-white text-xs font-bold rounded-lg hover:bg-[#007A4D] transition-colors shadow-2xs cursor-pointer"
              >
                + Add Salary Entry
              </button>
            </div>
          )}
        </div>

        {/* Last 3 Salary History (Redesigned with KPI-Metrics Card Layout, Watermarks & Animated Multi-Color Dots) */}
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
            {hasRecords && (
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="text-[11px] font-bold text-[#008F5B] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <span>Full History</span>
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {hasRecords ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {recentThree.map((rec, idx) => {
                const isSelected = rec.month === activeMonth;
                const fullMonth = getMonthYearFull(rec.month, rec.monthLabel);

                // 3 Watermark icons for the 3 salary records
                const watermarkIcons = [Landmark, Wallet, ShieldCheck];
                const WatermarkIcon = watermarkIcons[idx % watermarkIcons.length];

                return (
                  <button
                    key={rec.month}
                    type="button"
                    onClick={() => {
                      onSelectMonth(rec.month);
                      onNavigate('details');
                    }}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-200 cursor-pointer flex flex-col justify-between text-left group relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#E9F7F1] to-[#D8F3E5] border border-[#008F5B]/35 shadow-[0_4px_14px_rgba(0,143,91,0.08)] ring-1 ring-[#008F5B]/20 hover:shadow-md hover:border-[#008F5B]/60 hover:scale-[1.02]'
                        : 'bg-gradient-to-b from-white to-[#F6FAF8] border border-[#E0ECE6] shadow-[0_2px_10px_rgba(23,33,29,0.03)] hover:shadow-md hover:border-[#008F5B]/30 hover:bg-[#F2F9F5]'
                    }`}
                  >
                    {/* Watermark Icon - Top Right Clean matching KPI card */}
                    <div
                      className={`absolute top-2 right-2 transition-all duration-300 pointer-events-none group-hover:scale-105 ${
                        isSelected
                          ? 'text-[#008F5B]/[0.09] group-hover:text-[#008F5B]/[0.18]'
                          : 'text-[#17211D]/[0.06] group-hover:text-[#008F5B]/[0.12]'
                      }`}
                    >
                      <WatermarkIcon size={36} strokeWidth={1.5} />
                    </div>

                    {/* Top Month Title (e.g. JUNE 2026, JULY 2026, AUGUST 2026) */}
                    <div className="w-full relative z-10">
                      <span
                        className={`text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-tight leading-tight block truncate ${
                          isSelected ? 'text-[#008F5B]' : 'text-[#6E7974]'
                        }`}
                        title={fullMonth}
                      >
                        {fullMonth}
                      </span>
                    </div>

                    {/* Bottom Amount (Full formatBDT with .00 decimals) & Animated Multi-Color Dots */}
                    <div className="mt-1.5 relative z-10">
                      <strong
                        className={`block text-[9.5px] sm:text-[12px] font-black tracking-tight leading-tight ${
                          isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                        }`}
                      >
                        <BDT
                          amount={rec.net}
                          symbolClassName={`text-[1.18em] font-black mr-0.5 ${
                            isSelected ? 'text-[#008F5B]' : 'text-[#17211D]'
                          }`}
                        />
                      </strong>

                      {/* Animated Multi-Color Dots Indicator */}
                      <div className="mt-1.5 flex items-center gap-1.5 relative z-10">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008F5B] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#008F5B]"></span>
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse shrink-0" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse [animation-delay:200ms] shrink-0" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse [animation-delay:400ms] shrink-0" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center px-4 bg-[#F5FAF7] rounded-xl border border-dashed border-[#D1E5DC]">
              <Clock size={28} className="text-[#8A9791] mb-2" />
              <p className="text-xs font-semibold text-[#17211D]">No salary history available</p>
              <p className="text-[11px] text-[#6E7974] mt-0.5 max-w-xs">
                Your entries will be stored securely in your private account.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="mt-3 px-3 py-1.5 bg-[#008F5B] text-white text-xs font-bold rounded-lg hover:bg-[#007A4D] transition-colors shadow-2xs cursor-pointer"
              >
                + Add Salary Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
