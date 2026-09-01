import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  Calendar,
  BarChart3,
  Check,
  Percent,
  SlidersHorizontal,
  Wallet,
  Receipt,
  CheckCircle2,
  ArrowUpDown,
  ArrowRight,
  ShieldAlert,
  Calculator,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';
import { IncomeTaxCalculatorWidget } from './IncomeTaxCalculatorWidget';

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

const ALL_MONTHS = [
  { num: 1, key: '01', short: 'Jan', full: 'January' },
  { num: 2, key: '02', short: 'Feb', full: 'February' },
  { num: 3, key: '03', short: 'Mar', full: 'March' },
  { num: 4, key: '04', short: 'Apr', full: 'April' },
  { num: 5, key: '05', short: 'May', full: 'May' },
  { num: 6, key: '06', short: 'Jun', full: 'June' },
  { num: 7, key: '07', short: 'Jul', full: 'July' },
  { num: 8, key: '08', short: 'Aug', full: 'August' },
  { num: 9, key: '09', short: 'Sep', full: 'September' },
  { num: 10, key: '10', short: 'Oct', full: 'October' },
  { num: 11, key: '11', short: 'Nov', full: 'November' },
  { num: 12, key: '12', short: 'Dec', full: 'December' },
];

function resolveSalaryRecord(
  records: MonthSalaryRecord[],
  targetMonthKey: string
): MonthSalaryRecord {
  const found = records.find((r) => r.month === targetMonthKey);
  if (found) return found;

  const base = records[0] || {
    gross: 0,
    deduction: 0,
    net: 0,
    incomes: {},
    deductions: {},
    extraDeduction: [],
  };

  const [yS, mS] = (targetMonthKey || '2026-08').split('-');
  const y = parseInt(yS, 10) || new Date().getFullYear();
  const m = parseInt(mS, 10) || (new Date().getMonth() + 1);
  const monthName = ALL_MONTHS[m - 1]?.full || 'Month';
  const monthShort = ALL_MONTHS[m - 1]?.short || 'M';

  return {
    month: targetMonthKey,
    monthLabel: `${monthName} ${y}`,
    createdDate: `---`,
    gross: base.gross,
    deduction: base.deduction,
    net: base.net,
    incomes: { ...base.incomes },
    deductions: { ...base.deductions },
    extraDeduction: base.extraDeduction || [],
  };
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  salaryRecords,
  activeMonth,
  onSelectMonth,
  onNavigate,
}) => {
  const [filterMode, setFilterMode] = useState<'monthly' | 'yearly' | 'aggregate'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const [y] = (activeMonth || '2026-08').split('-');
    return parseInt(y, 10) || 2026;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewMode, setCalendarViewMode] = useState<'monthGrid' | 'dayGrid'>('monthGrid');
  const [activeIncomeIndex, setActiveIncomeIndex] = useState<number | null>(null);
  const [activeDeductionIndex, setActiveDeductionIndex] = useState<number | null>(null);

  // Parse active year and month
  const [activeYearStr, activeMonthStr] = (activeMonth || '2026-08').split('-');
  const parsedActiveYear = parseInt(activeYearStr, 10) || 2026;
  const parsedActiveMonth = parseInt(activeMonthStr, 10) || 8;

  const activeRecord = resolveSalaryRecord(salaryRecords, activeMonth);

  // Find previous month record for direct Month Comparison
  const sortedAllRecords = useMemo(() => {
    return [...salaryRecords].sort((a, b) => b.month.localeCompare(a.month));
  }, [salaryRecords]);

  const previousRecord = useMemo(() => {
    const currentIdx = sortedAllRecords.findIndex((r) => r.month === activeRecord.month);
    if (currentIdx !== -1 && currentIdx < sortedAllRecords.length - 1) {
      return sortedAllRecords[currentIdx + 1];
    }
    return sortedAllRecords.find((r) => r.month !== activeRecord.month) || null;
  }, [sortedAllRecords, activeRecord.month]);

  // Direct comparison metrics
  const netDiff = previousRecord ? activeRecord.net - previousRecord.net : 0;
  const netDiffPct =
    previousRecord && previousRecord.net > 0
      ? Number(((netDiff / previousRecord.net) * 100).toFixed(1))
      : 0;

  const grossDiff = previousRecord ? activeRecord.gross - previousRecord.gross : 0;
  const dedDiff = previousRecord ? activeRecord.deduction - previousRecord.deduction : 0;

  // Records for selected fiscal year
  const yearRecords = salaryRecords.filter((r) => r.month.startsWith(`${selectedYear}-`));
  const effectiveYearRecords =
    yearRecords.length > 0
      ? yearRecords
      : ALL_MONTHS.map((m) =>
          resolveSalaryRecord(salaryRecords, `${selectedYear}-${m.key}`)
        );

  const activeDataset =
    filterMode === 'monthly'
      ? [activeRecord]
      : filterMode === 'yearly'
      ? effectiveYearRecords
      : salaryRecords;

  // Aggregate metrics depending on filter mode
  const gross: number =
    filterMode === 'monthly'
      ? activeRecord.gross || 0
      : activeDataset.reduce((acc, r) => acc + (r.gross || 0), 0);

  const deduction: number =
    filterMode === 'monthly'
      ? activeRecord.deduction || 0
      : activeDataset.reduce((acc, r) => acc + (r.deduction || 0), 0);

  const net: number = gross - deduction;
  const netRatio = gross > 0 ? ((net / gross) * 100).toFixed(1) : '94.1';
  const deductionRatio = gross > 0 ? ((deduction / gross) * 100).toFixed(1) : '5.9';
  const avgNet = activeDataset.length > 0 ? Math.round(net / activeDataset.length) : net;

  // Income items distribution (filter out items with value <= 0)
  const incomeItems: [string, number][] = (
    filterMode === 'monthly'
      ? Object.entries(activeRecord.incomes || {}).map(([k, v]) => [k, Number(v || 0)] as [string, number])
      : Object.entries(
          activeDataset.reduce((acc, r) => {
            Object.entries(r.incomes || {}).forEach(([k, v]) => {
              acc[k] = (acc[k] || 0) + Number(v || 0);
            });
            return acc;
          }, {} as Record<string, number>)
        ).map(([k, v]) => [k, Number(v || 0)] as [string, number])
  )
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  // Deduction items distribution (filter out items with value <= 0)
  const deductionItems: [string, number][] = (
    filterMode === 'monthly'
      ? Object.entries(activeRecord.deductions || {}).map(([k, v]) => [k, Number(v || 0)] as [string, number])
      : Object.entries(
          activeDataset.reduce((acc, r) => {
            Object.entries(r.deductions || {}).forEach(([k, v]) => {
              acc[k] = (acc[k] || 0) + Number(v || 0);
            });
            return acc;
          }, {} as Record<string, number>)
        ).map(([k, v]) => [k, Number(v || 0)] as [string, number])
  )
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  // Continuous Calendar Navigation across years
  const handlePrevMonth = () => {
    let y = parsedActiveYear;
    let m = parsedActiveMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const newKey = `${y}-${m.toString().padStart(2, '0')}`;
    onSelectMonth(newKey);
    setSelectedYear(y);
  };

  const handleNextMonth = () => {
    let y = parsedActiveYear;
    let m = parsedActiveMonth + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const newKey = `${y}-${m.toString().padStart(2, '0')}`;
    onSelectMonth(newKey);
    setSelectedYear(y);
  };

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

      {salaryRecords.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center mt-12">
          <PieIcon size={48} className="text-[#8A9791] mb-3" />
          <h2 className="text-base font-bold text-[#17211D]">No Salary Analytics Available</h2>
          <p className="text-xs text-[#6E7974] mt-1 max-w-xs">
            There are no salary records in your account yet. Add a monthly salary entry to generate income charts, deduction breakdowns, and annual summaries.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('add')}
            className="mt-5 px-5 py-2.5 bg-[#008F5B] text-white text-xs font-bold rounded-xl hover:bg-[#007A4D] transition-all shadow-sm cursor-pointer"
          >
            + Add Salary Record
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 flex flex-col gap-3.5">
        {/* MODERN 3-WAY TAB SELECTOR (Monthly / Yearly / Aggregate) */}
        <div
          id="reports-segmented-tabs"
          className="w-full bg-white rounded-2xl border border-[#008F5B] overflow-hidden flex items-stretch shadow-2xs"
        >
          {/* Tab 1: Monthly */}
          <button
            type="button"
            id="tab-monthly-btn"
            onClick={() => setFilterMode('monthly')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              filterMode === 'monthly'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <Calendar
              size={14}
              className={filterMode === 'monthly' ? 'text-[#008F5B]' : 'text-[#6E7974]'}
            />
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              Monthly
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-[#008F5B] self-stretch shrink-0" />

          {/* Tab 2: Yearly */}
          <button
            type="button"
            id="tab-yearly-btn"
            onClick={() => setFilterMode('yearly')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              filterMode === 'yearly'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <BarChart3
              size={14}
              className={filterMode === 'yearly' ? 'text-[#008F5B]' : 'text-[#6E7974]'}
            />
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              Yearly
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-[#008F5B] self-stretch shrink-0" />

          {/* Tab 3: Aggregate */}
          <button
            type="button"
            id="tab-aggregate-btn"
            onClick={() => setFilterMode('aggregate')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              filterMode === 'aggregate'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <Layers
              size={14}
              className={filterMode === 'aggregate' ? 'text-[#008F5B]' : 'text-[#6E7974]'}
            />
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              Aggregate
            </span>
          </button>
        </div>

        {/* ELEGANT & INTUITIVE MONTH SELECTOR CARD WITH FULL CALENDAR SYSTEM */}
        {filterMode === 'monthly' && (
          <div
            id="reports-monthly-calendar-card"
            className="w-full bg-white dark:bg-[#14221C] rounded-2xl p-4 border border-[#E3ECE7] dark:border-[#21352C] shadow-[0_4px_22px_rgba(23,33,29,0.04)] flex flex-col gap-3"
          >
            {/* Header: Previous / Title / Next Navigation + Calendar Mode Toggle */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-xl bg-[#F3F7F5] dark:bg-[#101A16] hover:bg-[#E7EFEA] dark:hover:bg-[#192A22] text-[#17211D] dark:text-[#F1F7F4] flex items-center justify-center transition-all cursor-pointer border border-[#E2EBE6] dark:border-[#21352C] shrink-0"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft size={17} strokeWidth={2.4} />
              </button>

              <button
                type="button"
                id="reports-month-picker-toggle-btn"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl hover:bg-[#F3F7F5] dark:hover:bg-[#192A22] transition-colors cursor-pointer group"
                title="Click to open full Calendar & Year/Month Picker"
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isCalendarOpen ? 'bg-[#008F5B] text-white shadow-2xs' : 'bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594]'
                    }`}
                  >
                    <Calendar size={13} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight group-hover:text-[#008F5B] dark:group-hover:text-[#10E594] transition-colors">
                    {activeRecord.monthLabel}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[#6E7974] dark:text-[#9DB3A8] transition-transform duration-200 ${
                      isCalendarOpen ? 'rotate-180 text-[#008F5B] dark:text-[#10E594]' : 'group-hover:text-[#17211D] dark:group-hover:text-[#F1F7F4]'
                    }`}
                  />
                </div>
                <span className="text-[10.5px] text-[#6E7974] dark:text-[#9DB3A8] font-medium mt-0.5 flex items-center gap-1">
                  <span>Period:</span>
                  <span className="font-bold text-[#334155] dark:text-[#E2ECE7]">
                    {(() => {
                      const lastDay = new Date(parsedActiveYear, parsedActiveMonth, 0).getDate();
                      const shortM = ALL_MONTHS[parsedActiveMonth - 1]?.short || 'M';
                      return `01 ${shortM} – ${lastDay} ${shortM} ${parsedActiveYear}`;
                    })()}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-xl bg-[#F3F7F5] dark:bg-[#101A16] hover:bg-[#E7EFEA] dark:hover:bg-[#192A22] text-[#17211D] dark:text-[#F1F7F4] flex items-center justify-center transition-all cursor-pointer border border-[#E2EBE6] dark:border-[#21352C] shrink-0"
                title="Next Month"
                aria-label="Next Month"
              >
                <ChevronRight size={17} strokeWidth={2.4} />
              </button>
            </div>

            {/* FLUTTER-STYLE INTERACTIVE CALENDAR & YEAR/MONTH PICKER */}
            {isCalendarOpen && (
              <div
                id="flutter-calendar-widget"
                className="p-3.5 bg-gradient-to-b from-[#F8FAF9] to-[#F1F6F3] rounded-xl border border-[#DDE7E1] flex flex-col gap-3 transition-all animate-in fade-in duration-200"
              >
                {/* Year Navigation Stepper */}
                <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-xl border border-[#E2EBE6] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      const prevY = parsedActiveYear - 1;
                      onSelectMonth(`${prevY}-${activeMonthStr}`);
                      setSelectedYear(prevY);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F7F5] hover:bg-[#E7EFEA] text-[#17211D] flex items-center justify-center transition-all cursor-pointer"
                    title="Previous Year"
                  >
                    <ChevronLeft size={14} strokeWidth={2.5} />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-black text-[#17211D] tracking-tight">
                      {parsedActiveYear}
                    </span>
                    {/* View mode toggle pills */}
                    <div className="flex items-center bg-[#F3F7F5] p-0.5 rounded-lg border border-[#E2EBE6]">
                      <button
                        type="button"
                        onClick={() => setCalendarViewMode('monthGrid')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          calendarViewMode === 'monthGrid'
                            ? 'bg-[#008F5B] text-white shadow-2xs'
                            : 'text-[#6E7974] hover:text-[#17211D]'
                        }`}
                      >
                        Months
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarViewMode('dayGrid')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          calendarViewMode === 'dayGrid'
                            ? 'bg-[#008F5B] text-white shadow-2xs'
                            : 'text-[#6E7974] hover:text-[#17211D]'
                        }`}
                      >
                        Days
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextY = parsedActiveYear + 1;
                      onSelectMonth(`${nextY}-${activeMonthStr}`);
                      setSelectedYear(nextY);
                    }}
                    className="w-7 h-7 rounded-lg bg-[#F3F7F5] hover:bg-[#E7EFEA] text-[#17211D] flex items-center justify-center transition-all cursor-pointer"
                    title="Next Year"
                  >
                    <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {/* 1. 12-MONTH PICKER GRID (Select Any Month in 1 Tap) */}
                {calendarViewMode === 'monthGrid' ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {ALL_MONTHS.map((m) => {
                      const isCurrent = m.num === parsedActiveMonth;
                      const monthKey = `${parsedActiveYear}-${m.key}`;
                      const hasStatement = salaryRecords.some((r) => r.month === monthKey);

                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => {
                            onSelectMonth(monthKey);
                            setSelectedYear(parsedActiveYear);
                          }}
                          className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
                            isCurrent
                              ? 'bg-[#008F5B] text-white shadow-[0_2px_8px_rgba(0,143,91,0.3)] font-black scale-[1.02]'
                              : hasStatement
                              ? 'bg-white text-[#17211D] font-bold border border-[#008F5B]/30 hover:border-[#008F5B] hover:bg-[#F0FDF4]'
                              : 'bg-white/80 text-[#5C6E66] font-semibold border border-[#E4ECE8] hover:bg-white hover:text-[#17211D]'
                          }`}
                        >
                          <span className="text-[12px]">{m.short}</span>
                          <span className={`text-[9px] ${isCurrent ? 'text-white/80' : 'text-[#8A9791]'}`}>
                            {hasStatement ? 'Statement' : 'Forecast'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* 2. FULL DAY MATRIX VIEW (TableCalendar) */
                  <div className="flex flex-col gap-2">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[#6E7974] uppercase py-1 border-b border-[#E2EBE6]">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>

                    {/* Days matrix */}
                    {(() => {
                      const daysInMonth = new Date(parsedActiveYear, parsedActiveMonth, 0).getDate();
                      const startDayIndex = new Date(parsedActiveYear, parsedActiveMonth - 1, 1).getDay();
                      const daysArray = [];

                      for (let i = 0; i < startDayIndex; i++) {
                        daysArray.push(null);
                      }
                      for (let d = 1; d <= daysInMonth; d++) {
                        daysArray.push(d);
                      }

                      return (
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {daysArray.map((day, idx) => {
                            if (day === null) {
                              return <div key={`empty-${idx}`} className="h-7" />;
                            }
                            const isPayDay = day === daysInMonth || day === 30 || day === 31;

                            return (
                              <div
                                key={`day-${day}`}
                                className={`h-7 rounded-lg flex flex-col items-center justify-center text-[11px] font-semibold transition-all relative ${
                                  isPayDay
                                    ? 'bg-[#008F5B] text-white font-black shadow-xs ring-2 ring-[#008F5B]/30'
                                    : 'bg-white/70 text-[#334155] border border-[#E8EEEA]'
                                }`}
                              >
                                <span>{day}</span>
                                {isPayDay && (
                                  <span className="w-1 h-1 rounded-full bg-white absolute bottom-0.5" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E2EBE6] text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectMonth('2026-08');
                      setSelectedYear(2026);
                    }}
                    className="font-bold text-[#008F5B] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Calendar size={11} />
                    Current (Aug 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="font-bold text-[#6E7974] hover:text-[#17211D] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISUALLY DESIGNED FISCAL YEAR CARD (NO PILLS, CLEAN STEPPER) */}
        {filterMode === 'yearly' && (
          <div
            id="reports-yearly-calendar-card"
            className="w-full bg-white rounded-2xl p-4 border border-[#E3ECE7] shadow-[0_4px_22px_rgba(23,33,29,0.04)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              {/* Previous Fiscal Year */}
              <button
                type="button"
                onClick={() => setSelectedYear((prev) => prev - 1)}
                className="w-9 h-9 rounded-xl bg-[#F3F7F5] hover:bg-[#E7EFEA] text-[#17211D] flex items-center justify-center transition-all cursor-pointer border border-[#E2EBE6] shrink-0"
                title="Previous Year"
              >
                <ChevronLeft size={17} strokeWidth={2.4} />
              </button>

              {/* Fiscal Year Label */}
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                    <BarChart3 size={13} strokeWidth={2.4} />
                  </div>
                  <span className="text-[15px] font-black text-[#17211D] tracking-tight">
                    Fiscal Year {selectedYear}
                  </span>
                </div>
                <span className="text-[10.5px] text-[#6E7974] font-medium mt-0.5">
                  {yearRecords.length > 0 ? `${yearRecords.length} Statements Recorded` : '12 Months Annual Projection'}
                </span>
              </div>

              {/* Next Fiscal Year */}
              <button
                type="button"
                onClick={() => setSelectedYear((prev) => prev + 1)}
                className="w-9 h-9 rounded-xl bg-[#F3F7F5] hover:bg-[#E7EFEA] text-[#17211D] flex items-center justify-center transition-all cursor-pointer border border-[#E2EBE6] shrink-0"
                title="Next Year"
              >
                <ChevronRight size={17} strokeWidth={2.4} />
              </button>
            </div>

            <div
              id="reports-annual-avg-net-card"
              className="flex flex-col items-center justify-center text-center py-2 px-3 rounded-xl bg-gradient-to-br from-[#F8FAF9] to-[#F1F6F3] dark:from-[#0E1B15] dark:to-[#13241D] border border-[#E3ECE7] dark:border-[#21352C] gap-0.5 shadow-2xs"
            >
              <span className="text-[10px] font-bold text-[#6E7974] dark:text-[#9DB3A8] uppercase tracking-wider">
                ANNUAL AVERAGE NET AMOUNT
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-black text-[#008F5B] dark:text-[#10E594] tracking-tight">
                  {formatBDT(avgNet)}
                </span>
                <span className="text-[10px] font-semibold text-[#6E7974] dark:text-[#9DB3A8] uppercase tracking-wide">
                  Per Month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VISUALLY DESIGNED LIFETIME CUMULATIVE CARD */}
        {filterMode === 'aggregate' && (
          <div
            id="reports-aggregate-calendar-card"
            className="w-full bg-white rounded-2xl p-4 border border-[#E3ECE7] shadow-[0_4px_22px_rgba(23,33,29,0.04)] flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
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

            <div
              id="reports-historical-avg-net-card"
              className="flex flex-col items-center justify-center text-center py-2 px-3 rounded-xl bg-gradient-to-br from-[#F8FAF9] to-[#F1F6F3] dark:from-[#0E1B15] dark:to-[#13241D] border border-[#E3ECE7] dark:border-[#21352C] gap-0.5 shadow-2xs"
            >
              <span className="text-[10px] font-bold text-[#6E7974] dark:text-[#9DB3A8] uppercase tracking-wider">
                HISTORICAL AVERAGE NET AMOUNT
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] font-black text-[#008F5B] dark:text-[#10E594] tracking-tight">
                  {formatBDT(avgNet)}
                </span>
                <span className="text-[10px] font-semibold text-[#6E7974] dark:text-[#9DB3A8] uppercase tracking-wide">
                  Per Month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3-COLUMN ULTRA-MODERN METRICS CARDS WITH RICH VISUAL GRAPHICS & PROGRESS TRACKS */}
        <div
          id="reports-kpi-bar"
          className="w-full grid grid-cols-3 gap-2 sm:gap-3"
        >
          {/* Card 1: Gross */}
          <div className="bg-gradient-to-br from-white via-[#F8FAF9] to-[#EEF5F1] p-3 sm:p-3.5 rounded-2xl border border-[#D8E6DF] shadow-[0_4px_16px_rgba(0,35,20,0.04)] flex flex-col justify-between relative overflow-hidden group hover:border-[#008F5B]/40 transition-all">
            {/* Watermark Icon - Top Right Clean (kpi-metrics-cards style) */}
            <div className="absolute top-2 right-2 text-[#17211D]/[0.06] group-hover:text-[#008F5B]/[0.12] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <Layers size={36} strokeWidth={1.5} />
            </div>

            {/* Top Row: Label */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[9.5px] font-extrabold text-[#5C6E66] uppercase tracking-wider">
                {filterMode === 'monthly' ? 'GROSS' : 'TOTAL GROSS'}
              </span>
            </div>

            {/* Value */}
            <div className="mt-1.5 flex flex-col relative z-10">
              <strong className="text-[13px] sm:text-[14.5px] font-black text-[#17211D] tracking-tight leading-tight">
                {formatBDT(gross)}
              </strong>
            </div>

            {/* Bottom Visual Mini Progress Bar */}
            <div className="mt-2.5 flex flex-col gap-1 relative z-10">
              <div className="w-full h-1.5 rounded-full bg-[#E2EBE6] overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-[#008F5B] to-[#00B377] rounded-full" />
              </div>
              <span className="text-[8.5px] text-[#008F5B] font-extrabold">
                Rate: 100%
              </span>
            </div>
          </div>

          {/* Card 2: Deduction */}
          <div className="bg-gradient-to-br from-white via-[#FFF7F7] to-[#FEECEE] p-3 sm:p-3.5 rounded-2xl border border-[#FDCFD4] shadow-[0_4px_16px_rgba(216,59,59,0.04)] flex flex-col justify-between relative overflow-hidden group hover:border-[#DC2626]/40 transition-all">
            {/* Watermark Icon - Top Right Clean (kpi-metrics-cards style) */}
            <div className="absolute top-2 right-2 text-[#D83B3B]/[0.08] group-hover:text-[#D83B3B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <ShieldAlert size={36} strokeWidth={1.5} />
            </div>

            {/* Top Row: Label */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[9.5px] font-extrabold text-[#D83B3B] uppercase tracking-wider">
                {filterMode === 'monthly' ? 'DEDUCTION' : 'DEDUCTIONS'}
              </span>
            </div>

            {/* Value */}
            <div className="mt-1.5 flex flex-col relative z-10">
              <strong className="text-[13px] sm:text-[14.5px] font-black text-[#D83B3B] tracking-tight leading-tight">
                {formatBDT(deduction)}
              </strong>
            </div>

            {/* Bottom Visual Mini Progress Bar */}
            <div className="mt-2.5 flex flex-col gap-1 relative z-10">
              <div className="w-full h-1.5 rounded-full bg-[#FEE2E2] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(8, Number(deductionRatio)))}%` }}
                />
              </div>
              <span className="text-[8.5px] text-[#D83B3B] font-extrabold">
                Rate: {deductionRatio}%
              </span>
            </div>
          </div>

          {/* Card 3: Net Payable / Savings */}
          <div className="bg-gradient-to-br from-[#F0FDF4] via-[#E6F9EE] to-[#DCFCE7] p-3 sm:p-3.5 rounded-2xl border border-[#86EFAC] shadow-[0_6px_20px_rgba(0,143,91,0.08)] ring-1 ring-[#008F5B]/10 flex flex-col justify-between relative overflow-hidden group hover:border-[#008F5B] transition-all">
            {/* Watermark Icon - Top Right Clean (kpi-metrics-cards style) */}
            <div className="absolute top-2 right-2 text-[#008F5B]/[0.08] group-hover:text-[#008F5B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
              <Wallet size={36} strokeWidth={1.5} />
            </div>

            {/* Top Row: Label */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[9.5px] font-extrabold text-[#008F5B] uppercase tracking-wider">
                {filterMode === 'monthly' ? 'NET PAYABLE' : 'NET EARNINGS'}
              </span>
            </div>

            {/* Value */}
            <div className="mt-1.5 flex flex-col relative z-10">
              <strong className="text-[13px] sm:text-[14.5px] font-black text-[#008F5B] tracking-tight leading-tight">
                {formatBDT(net)}
              </strong>
            </div>

            {/* Bottom Visual Mini Progress Bar */}
            <div className="mt-2.5 flex flex-col gap-1 relative z-10">
              <div className="w-full h-1.5 rounded-full bg-[#BBF7D0] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#008F5B] to-[#10B981] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, Number(netRatio)))}%` }}
                />
              </div>
              <span className="text-[8.5px] text-[#008F5B] font-extrabold">
                Rate: {netRatio}%
              </span>
            </div>
          </div>
        </div>

        {/* 1. Income Breakdown Donut Card with Interactive Segment Highlight */}
        <div
          id="reports-income-breakdown-card"
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
                {incomeItems.map(([key, val], idx) => {
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
                  {activeIncomeIndex !== null && incomeItems[activeIncomeIndex]
                    ? formatBDT(Number(incomeItems[activeIncomeIndex][1]))
                    : `${incomeItems.length} Heads`}
                </span>
                <span className="text-[7px] text-[#6E7974] font-bold uppercase truncate max-w-[62px]">
                  {activeIncomeIndex !== null && incomeItems[activeIncomeIndex]
                    ? incomeItems[activeIncomeIndex][0]
                    : 'Earnings'}
                </span>
              </div>
            </div>

            {/* Legend Distribution List */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
              {incomeItems.map(([key, val], idx) => {
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
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
                {deductionItems.map(([key, val], idx) => {
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
                  {activeDeductionIndex !== null && deductionItems[activeDeductionIndex]
                    ? formatBDT(Number(deductionItems[activeDeductionIndex][1]))
                    : `${deductionItems.length} Heads`}
                </span>
                <span className="text-[7px] text-[#6E7974] font-bold uppercase truncate max-w-[62px]">
                  {activeDeductionIndex !== null && deductionItems[activeDeductionIndex]
                    ? deductionItems[activeDeductionIndex][0]
                    : 'Deductions'}
                </span>
              </div>
            </div>

            {/* Legend Distribution List */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-xs">
              {deductionItems.map(([key, val], idx) => {
                const numVal = Number(val);
                const isHovered = activeDeductionIndex === idx;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => setActiveDeductionIndex(idx)}
                    onMouseLeave={() => setActiveDeductionIndex(null)}
                    className={`flex items-center justify-between text-[11px] p-1.5 rounded-lg transition-all cursor-pointer ${
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

        {/* 3. Month Comparison Section */}
        <div
          id="reports-month-comparison-card"
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
                    ? `${activeRecord.monthLabel.split(' ')[0]} vs ${previousRecord.monthLabel.split(' ')[0]}`
                    : 'Latest trend analysis'}
                </span>
              </div>
            </div>

            {previousRecord && (
              <div
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                  netDiff >= 0
                    ? 'bg-[#E9F7F1] text-[#008F5B] border border-[#008F5B]/30'
                    : 'bg-[#FDF2F2] text-[#D83B3B] border border-[#D83B3B]/30'
                }`}
              >
                {netDiff >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>
                  {netDiff >= 0 ? '+' : ''}
                  {netDiffPct}% Net
                </span>
              </div>
            )}
          </div>

          {/* 3 Micro Comparison Stats */}
          {previousRecord ? (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {/* Net Stat */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F5FAF7] border border-[#008F5B]/30 shadow-[0_2px_8px_rgba(0,143,91,0.04)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Net/Wallet) - Top Right like KPI cards */}
                <div className="absolute top-2 right-2 text-[#008F5B]/[0.08] group-hover:text-[#008F5B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <Wallet size={36} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] sm:text-[9.5px] font-black text-[#008F5B] uppercase tracking-wider block">
                    Net Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10.5px] sm:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      netDiff >= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {netDiff >= 0 ? '+' : ''}
                    {formatBDT(netDiff)}
                  </strong>

                  {/* Vs previous month with font-size 10px, font-weight 700 and large bold Taka symbol */}
                  <div className="mt-1 text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#6E7974] font-bold">Vs</span>
                    <span className="text-[12px] font-extrabold text-[#17211D] leading-none">৳</span>
                    <span className="font-bold text-[#17211D]">
                      {Number(previousRecord.net || 0).toLocaleString('en-BD', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Stat */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F6FAF8] border border-[#D8E6DF] shadow-[0_2px_8px_rgba(23,33,29,0.03)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Gross/Layers) - Top Right like KPI cards */}
                <div className="absolute top-2 right-2 text-[#17211D]/[0.07] group-hover:text-[#008F5B]/[0.12] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <Layers size={36} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] sm:text-[9.5px] font-black text-[#5C6E66] uppercase tracking-wider block">
                    Gross Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10.5px] sm:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      grossDiff >= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {grossDiff >= 0 ? '+' : ''}
                    {formatBDT(grossDiff)}
                  </strong>

                  {/* Vs previous month with font-size 10px, font-weight 700 and large bold Taka symbol */}
                  <div className="mt-1 text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#6E7974] font-bold">Vs</span>
                    <span className="text-[12px] font-extrabold text-[#17211D] leading-none">৳</span>
                    <span className="font-bold text-[#17211D]">
                      {Number(previousRecord.gross || 0).toLocaleString('en-BD', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deduction Stat */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FFF6F6] border border-[#FDCFD4] shadow-[0_2px_8px_rgba(216,59,59,0.03)] flex flex-col justify-between relative overflow-hidden group">
                {/* Theme Watermark Icon (Deduction/ShieldAlert) - Top Right like KPI cards */}
                <div className="absolute top-2 right-2 text-[#D83B3B]/[0.08] group-hover:text-[#D83B3B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                  <ShieldAlert size={36} strokeWidth={1.5} />
                </div>

                <div className="relative z-10">
                  <span className="text-[9px] sm:text-[9.5px] font-black text-[#D83B3B] uppercase tracking-wider block">
                    Deduct Shift
                  </span>
                </div>

                <div className="mt-1 relative z-10">
                  <strong
                    className={`block text-[10.5px] sm:text-[12.5px] font-black tracking-tight leading-tight whitespace-nowrap ${
                      dedDiff <= 0 ? 'text-[#008F5B]' : 'text-[#D83B3B]'
                    }`}
                  >
                    {dedDiff >= 0 ? '+' : ''}
                    {formatBDT(dedDiff)}
                  </strong>

                  {/* Vs previous month with font-size 10px, font-weight 700 and large bold Taka symbol */}
                  <div className="mt-1 text-[10px] font-bold text-[#8A1A1A] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                    <span className="text-[#D83B3B]/80 font-bold">Vs</span>
                    <span className="text-[12px] font-extrabold text-[#D83B3B] leading-none">৳</span>
                    <span className="font-bold text-[#D83B3B]">
                      {Number(previousRecord.deduction || 0).toLocaleString('en-BD', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
            id="reports-open-full-comparison-btn"
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

        {/* NBR BANGLADESH INCOME TAX ESTIMATOR & ASSESSMENT */}
        <IncomeTaxCalculatorWidget
          salaryRecords={salaryRecords}
          selectedYear={selectedYear}
        />
      </div>
      )}
    </div>
  );
};
