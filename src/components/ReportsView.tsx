import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Layers,
  Calendar,
  BarChart3,
  Check,
  Percent,
  SlidersHorizontal,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface ReportsViewProps {
  salaryRecords: MonthSalaryRecord[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

const INCOME_COLORS = [
  '#008F5B', // Emerald Primary
  '#00C980', // Mint Green
  '#2563EB', // Vibrant Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#64748B', // Slate
];

const DEDUCTION_COLORS = [
  '#D83B3B', // Crimson
  '#EA580C', // Orange
  '#9333EA', // Purple
  '#0284C7', // Sky Blue
  '#E11D48', // Rose
  '#475569', // Slate
];

export const ReportsView: React.FC<ReportsViewProps> = ({
  salaryRecords,
  activeMonth,
  onSelectMonth,
}) => {
  const [filterMode, setFilterMode] = useState<'monthly' | 'yearly' | 'aggregate'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number | null>(null);
  const [activeDeductionIndex, setActiveDeductionIndex] = useState<number | null>(null);

  const activeRecord =
    salaryRecords.find((r) => r.month === activeMonth) || salaryRecords[0];

  // Records filtered by mode
  const yearRecords = salaryRecords.filter((r) => r.month.startsWith(selectedYear));
  const activeDataset =
    filterMode === 'monthly'
      ? [activeRecord].filter(Boolean)
      : filterMode === 'yearly'
      ? yearRecords.length > 0
        ? yearRecords
        : salaryRecords
      : salaryRecords;

  // Aggregate metrics depending on filter mode
  const gross: number =
    filterMode === 'monthly'
      ? activeRecord?.gross || 0
      : activeDataset.reduce((acc, r) => acc + (r.gross || 0), 0);

  const deduction: number =
    filterMode === 'monthly'
      ? activeRecord?.deduction || 0
      : activeDataset.reduce((acc, r) => acc + (r.deduction || 0), 0);

  const net: number = gross - deduction;
  const netRatio = gross > 0 ? ((net / gross) * 100).toFixed(1) : '67.4';
  const deductionRatio = gross > 0 ? ((deduction / gross) * 100).toFixed(1) : '32.6';
  const avgNet = activeDataset.length > 0 ? Math.round(net / activeDataset.length) : net;

  // Income items distribution
  const incomeItems: [string, number][] =
    filterMode === 'monthly'
      ? Object.entries(activeRecord?.incomes || {}).map(([k, v]) => [k, Number(v || 0)])
      : Object.entries(
          activeDataset.reduce((acc, r) => {
            Object.entries(r.incomes).forEach(([k, v]) => {
              acc[k] = (acc[k] || 0) + Number(v || 0);
            });
            return acc;
          }, {} as Record<string, number>)
        ).map(([k, v]) => [k, Number(v || 0)]);

  // Deduction items distribution
  const deductionItems: [string, number][] =
    filterMode === 'monthly'
      ? Object.entries(activeRecord?.deductions || {}).map(([k, v]) => [k, Number(v || 0)])
      : Object.entries(
          activeDataset.reduce((acc, r) => {
            Object.entries(r.deductions).forEach(([k, v]) => {
              acc[k] = (acc[k] || 0) + Number(v || 0);
            });
            return acc;
          }, {} as Record<string, number>)
        ).map(([k, v]) => [k, Number(v || 0)]);

  const currentMonthIndex = salaryRecords.findIndex((r) => r.month === activeMonth);
  const handlePrevMonth = () => {
    if (currentMonthIndex < salaryRecords.length - 1) {
      onSelectMonth(salaryRecords[currentMonthIndex + 1].month);
    }
  };
  const handleNextMonth = () => {
    if (currentMonthIndex > 0) {
      onSelectMonth(salaryRecords[currentMonthIndex - 1].month);
    }
  };

  const availableYears = Array.from(
    new Set(salaryRecords.map((r) => r.month.substring(0, 4)))
  ).sort().reverse();

  return (
    <div id="reports-view-screen" className="w-full flex flex-col pb-8">
      {/* Top Header - Pristine & Clean */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#008F5B]/10 text-[#008F5B] flex items-center justify-center font-bold">
            <PieIcon size={18} />
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#17211D] tracking-tight leading-tight">
              Reports & Analytics
            </h1>
            <span className="text-[11px] text-[#6E7974] font-medium block">
              Financial Breakdown & Insights
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3.5">
        {/* MODERN 3-WAY TAB SELECTOR (Monthly / Yearly / Aggregate) */}
        <div
          id="reports-segmented-tabs"
          className="w-full bg-[#EEF4F1] p-1.5 rounded-2xl border border-[#D7E0DC] grid grid-cols-3 gap-1 shadow-inner"
        >
          {/* Tab 1: Monthly */}
          <button
            type="button"
            id="tab-monthly-btn"
            onClick={() => setFilterMode('monthly')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              filterMode === 'monthly'
                ? 'bg-white text-[#008F5B] shadow-sm ring-1 ring-[#008F5B]/20 scale-[1.02]'
                : 'text-[#6E7974] hover:text-[#17211D] hover:bg-white/40'
            }`}
          >
            <Calendar size={14} className={filterMode === 'monthly' ? 'text-[#008F5B]' : 'text-[#8A9791]'} />
            <span>Monthly</span>
          </button>

          {/* Tab 2: Yearly */}
          <button
            type="button"
            id="tab-yearly-btn"
            onClick={() => setFilterMode('yearly')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              filterMode === 'yearly'
                ? 'bg-white text-[#008F5B] shadow-sm ring-1 ring-[#008F5B]/20 scale-[1.02]'
                : 'text-[#6E7974] hover:text-[#17211D] hover:bg-white/40'
            }`}
          >
            <BarChart3 size={14} className={filterMode === 'yearly' ? 'text-[#008F5B]' : 'text-[#8A9791]'} />
            <span>Yearly</span>
          </button>

          {/* Tab 3: Aggregate */}
          <button
            type="button"
            id="tab-aggregate-btn"
            onClick={() => setFilterMode('aggregate')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
              filterMode === 'aggregate'
                ? 'bg-white text-[#008F5B] shadow-sm ring-1 ring-[#008F5B]/20 scale-[1.02]'
                : 'text-[#6E7974] hover:text-[#17211D] hover:bg-white/40'
            }`}
          >
            <Layers size={14} className={filterMode === 'aggregate' ? 'text-[#008F5B]' : 'text-[#8A9791]'} />
            <span>Aggregate</span>
          </button>
        </div>

        {/* SIMPLE & PREMIUM MONTH & DATE CALENDAR NAVIGATOR */}
        {filterMode === 'monthly' && (
          <div
            id="reports-monthly-calendar-card"
            className="w-full bg-white rounded-[22px] p-3.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3"
          >
            {/* Header with Prev/Next and Date Range */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex >= salaryRecords.length - 1}
                className="w-8 h-8 rounded-xl bg-[#F5FAF7] hover:bg-[#E9F7F1] disabled:opacity-30 text-[#17211D] flex items-center justify-center transition-colors cursor-pointer border border-[#E4ECE8]"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[14px] font-black text-[#17211D] tracking-tight">
                  {activeRecord?.monthLabel}
                </span>
                <span className="text-[10px] text-[#6E7974] font-medium mt-0.5">
                  Period: 01 {activeRecord?.monthLabel?.substring(0, 3)} – 30/31 {activeRecord?.monthLabel?.substring(0, 3)} {activeRecord?.month?.substring(0, 4)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={currentMonthIndex <= 0}
                className="w-8 h-8 rounded-xl bg-[#F5FAF7] hover:bg-[#E9F7F1] disabled:opacity-30 text-[#17211D] flex items-center justify-center transition-colors cursor-pointer border border-[#E4ECE8]"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Clean Month Quick Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#F0F4F2]">
              {salaryRecords.map((r) => {
                const isSelected = r.month === activeMonth;
                return (
                  <button
                    key={r.month}
                    type="button"
                    onClick={() => onSelectMonth(r.month)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#008F5B] text-white shadow-2xs'
                        : 'bg-[#F5FAF7] text-[#6E7974] hover:text-[#17211D] hover:bg-[#EBF2EE]'
                    }`}
                  >
                    {r.monthLabel.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* VISUALLY DESIGNED FISCAL YEAR CARD */}
        {filterMode === 'yearly' && (
          <div
            id="reports-yearly-calendar-card"
            className="w-full bg-white rounded-[22px] p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center font-bold">
                  <BarChart3 size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-[#17211D]">
                    Fiscal Year {selectedYear}
                  </span>
                  <span className="text-[10.5px] text-[#6E7974] font-medium">
                    {yearRecords.length} statements recorded in cycle
                  </span>
                </div>
              </div>

              {/* Year Selector Buttons */}
              <div className="flex items-center gap-1 bg-[#F5FAF7] p-1 rounded-xl border border-[#E4ECE8]">
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-[#008F5B] text-white shadow-2xs'
                        : 'text-[#6E7974] hover:text-[#17211D]'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8]">
              <span className="text-[11px] font-bold text-[#6E7974] uppercase tracking-wider">
                MONTHLY AVERAGE NET
              </span>
              <span className="text-[13px] font-black text-[#008F5B]">
                {formatBDT(avgNet)}/mo
              </span>
            </div>
          </div>
        )}

        {/* VISUALLY DESIGNED LIFETIME CUMULATIVE CARD */}
        {filterMode === 'aggregate' && (
          <div
            id="reports-aggregate-calendar-card"
            className="w-full bg-white rounded-[22px] p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center font-bold">
                  <Layers size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-[#17211D]">
                    Lifetime Cumulative Analytics
                  </span>
                  <span className="text-[10.5px] text-[#6E7974] font-medium">
                    All {salaryRecords.length} recorded pay periods consolidated
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8]">
              <span className="text-[11px] font-bold text-[#6E7974] uppercase tracking-wider">
                HISTORICAL AVERAGE TAKE-HOME
              </span>
              <span className="text-[13px] font-black text-[#008F5B]">
                {formatBDT(avgNet)}/mo
              </span>
            </div>
          </div>
        )}

        {/* 3-Column Metrics Card with Colored Badges */}
        <div
          id="reports-kpi-bar"
          className="w-full bg-white rounded-[22px] p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] grid grid-cols-3 divide-x divide-[#E4ECE8]"
        >
          <div className="flex flex-col items-center justify-center px-1 text-center">
            <span className="text-[10px] font-bold text-[#6E7974] uppercase tracking-wider">
              {filterMode === 'monthly' ? 'GROSS' : 'TOTAL GROSS'}
            </span>
            <strong className="text-[13px] font-black text-[#17211D] mt-1">
              {formatBDT(gross)}
            </strong>
            <span className="text-[9px] text-[#6E7974] font-semibold mt-0.5">100% Total</span>
          </div>
          <div className="flex flex-col items-center justify-center px-1 text-center">
            <span className="text-[10px] font-bold text-[#6E7974] uppercase tracking-wider">
              {filterMode === 'monthly' ? 'DEDUCTION' : 'TOTAL DEDUCTION'}
            </span>
            <strong className="text-[13px] font-black text-[#D83B3B] mt-1">
              {formatBDT(deduction)}
            </strong>
            <span className="text-[9px] text-[#D83B3B] font-bold mt-0.5">{deductionRatio}%</span>
          </div>
          <div className="flex flex-col items-center justify-center px-1 text-center">
            <span className="text-[10px] font-bold text-[#6E7974] uppercase tracking-wider">
              {filterMode === 'monthly' ? 'NET SAVINGS' : 'NET EARNINGS'}
            </span>
            <strong className="text-[13px] font-black text-[#008F5B] mt-1">
              {formatBDT(net)}
            </strong>
            <span className="text-[9px] text-[#008F5B] font-bold mt-0.5">{netRatio}%</span>
          </div>
        </div>

        {/* 1. Income Breakdown Donut Card with Interactive Segment Highlight */}
        <div
          id="reports-income-breakdown-card"
          className="w-full bg-white rounded-[24px] p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B]" />
              <h3 className="text-[14px] font-extrabold text-[#17211D]">
                Income Breakdown
              </h3>
            </div>
            <span className="text-[13px] font-black text-[#008F5B] bg-[#E9F7F1] px-2.5 py-0.5 rounded-full">
              {formatBDT(gross)}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* SVG Donut Chart with Hover and Animation */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90 drop-shadow-xs" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#E9F7F1"
                  strokeWidth="5"
                />
                {/* Segments */}
                {incomeItems.slice(0, 5).map(([key, val], idx) => {
                  const numVal = Number(val);
                  const pct = gross > 0 ? (numVal / gross) * 100 : 0;
                  const offset = incomeItems
                    .slice(0, idx)
                    .reduce((acc, [, v]) => acc + (gross > 0 ? (Number(v) / gross) * 100 : 0), 0);

                  const isHovered = activeIncomeIndex === idx;

                  return (
                    <circle
                      key={key}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={INCOME_COLORS[idx % INCOME_COLORS.length]}
                      strokeWidth={isHovered ? 6.5 : 5}
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={`-${offset}`}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveIncomeIndex(idx)}
                      onMouseLeave={() => setActiveIncomeIndex(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight text-center px-1">
                <span className="text-[10px] font-black text-[#008F5B] truncate max-w-[62px]">
                  {activeIncomeIndex !== null
                    ? formatBDT(Number(incomeItems[activeIncomeIndex][1]))
                    : `${incomeItems.length} Heads`}
                </span>
                <span className="text-[7px] text-[#6E7974] font-bold uppercase truncate max-w-[62px]">
                  {activeIncomeIndex !== null
                    ? incomeItems[activeIncomeIndex][0]
                    : 'Earnings'}
                </span>
              </div>
            </div>

            {/* Legend Distribution List */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
              {incomeItems.slice(0, 5).map(([key, val], idx) => {
                const numVal = Number(val);
                const isHovered = activeIncomeIndex === idx;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => setActiveIncomeIndex(idx)}
                    onMouseLeave={() => setActiveIncomeIndex(null)}
                    className={`flex items-center justify-between text-[11px] p-1.5 rounded-xl transition-all cursor-pointer ${
                      isHovered ? 'bg-[#E9F7F1]' : 'hover:bg-[#F5FAF7]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: INCOME_COLORS[idx % INCOME_COLORS.length] }}
                      />
                      <span className="text-[#17211D] font-semibold truncate text-[11px]">
                        {key}
                      </span>
                    </div>
                    <div className="flex items-center shrink-0">
                      <strong className="text-[#17211D] font-black text-[11px] tracking-tight whitespace-nowrap">
                        {formatBDT(numVal)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Deduction Breakdown Donut Card */}
        <div
          id="reports-deduction-breakdown-card"
          className="w-full bg-white rounded-[24px] p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B]" />
              <h3 className="text-[14px] font-extrabold text-[#17211D]">
                Deduction Breakdown
              </h3>
            </div>
            <span className="text-[13px] font-black text-[#D83B3B] bg-[#FFF5F5] border border-[#FFECEC] px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {formatBDT(deduction)}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* SVG Donut Chart */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90 drop-shadow-xs" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#FFEEEE"
                  strokeWidth="5"
                />
                {deductionItems.slice(0, 5).map(([key, val], idx) => {
                  const numVal = Number(val);
                  const pct = deduction > 0 ? (numVal / deduction) * 100 : 0;
                  const offset = deductionItems
                    .slice(0, idx)
                    .reduce((acc, [, v]) => acc + (deduction > 0 ? (Number(v) / deduction) * 100 : 0), 0);

                  const isHovered = activeDeductionIndex === idx;

                  return (
                    <circle
                      key={key}
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke={DEDUCTION_COLORS[idx % DEDUCTION_COLORS.length]}
                      strokeWidth={isHovered ? 6.5 : 5}
                      strokeDasharray={`${pct} ${100 - pct}`}
                      strokeDashoffset={`-${offset}`}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveDeductionIndex(idx)}
                      onMouseLeave={() => setActiveDeductionIndex(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight text-center px-1">
                <span className="text-[10px] font-black text-[#D83B3B] truncate max-w-[62px]">
                  {activeDeductionIndex !== null
                    ? formatBDT(Number(deductionItems[activeDeductionIndex][1]))
                    : `${deductionItems.length} Heads`}
                </span>
                <span className="text-[7px] text-[#6E7974] font-bold uppercase truncate max-w-[62px]">
                  {activeDeductionIndex !== null
                    ? deductionItems[activeDeductionIndex][0]
                    : 'Deductions'}
                </span>
              </div>
            </div>

            {/* Legend Distribution List */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
              {deductionItems.slice(0, 5).map(([key, val], idx) => {
                const numVal = Number(val);
                const isHovered = activeDeductionIndex === idx;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => setActiveDeductionIndex(idx)}
                    onMouseLeave={() => setActiveDeductionIndex(null)}
                    className={`flex items-center justify-between text-[11px] p-1.5 rounded-xl transition-all cursor-pointer ${
                      isHovered ? 'bg-[#FFECEC]/50' : 'hover:bg-[#F5FAF7]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate mr-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: DEDUCTION_COLORS[idx % DEDUCTION_COLORS.length] }}
                      />
                      <span className="text-[#17211D] font-semibold truncate text-[11px]">
                        {key}
                      </span>
                    </div>
                    <div className="flex items-center shrink-0">
                      <strong className="text-[#17211D] font-black text-[11px] tracking-tight whitespace-nowrap">
                        {formatBDT(numVal)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Records Year Banner with Modern Metallic Rim */}
        <div
          id="reports-total-records-banner"
          className="w-full bg-gradient-to-r from-[#008F5B]/10 via-white to-[#008F5B]/10 rounded-2xl p-3.5 border border-[#008F5B]/20 text-center flex items-center justify-center gap-2 shadow-2xs"
        >
          <Sparkles size={14} className="text-[#008F5B]" />
          <span className="text-[11px] font-bold text-[#17211D] uppercase tracking-wider">
            Active Records in 2026:{' '}
            <strong className="text-[#008F5B] font-black text-[13px]">
              {String(salaryRecords.length).padStart(2, '0')} Months Synced
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
