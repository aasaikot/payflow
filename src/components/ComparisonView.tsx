import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  MinusCircle,
  Calendar,
  Layers,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Wallet,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';
import { BDT } from './BDT';

interface ComparisonViewProps {
  salaryRecords: MonthSalaryRecord[];
  activeMonth?: string;
  onNavigate: (screen: ScreenType) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  salaryRecords,
  activeMonth,
  onNavigate,
}) => {
  // Sort records descending by month
  const sortedRecords = useMemo(() => {
    return [...salaryRecords].sort((a, b) => b.month.localeCompare(a.month));
  }, [salaryRecords]);

  // Default Month A to activeMonth or latest month
  const initialMonthA = useMemo(() => {
    if (activeMonth && sortedRecords.some((r) => r.month === activeMonth)) {
      return activeMonth;
    }
    return sortedRecords[0]?.month || '2026-08';
  }, [activeMonth, sortedRecords]);

  // Default Month B to the month immediately preceding Month A, or second latest
  const initialMonthB = useMemo(() => {
    const idxA = sortedRecords.findIndex((r) => r.month === initialMonthA);
    if (idxA !== -1 && idxA < sortedRecords.length - 1) {
      return sortedRecords[idxA + 1].month;
    }
    if (sortedRecords.length > 1) {
      return sortedRecords[1].month;
    }
    return sortedRecords[0]?.month || '2026-07';
  }, [initialMonthA, sortedRecords]);

  const [monthAKey, setMonthAKey] = useState<string>(initialMonthA);
  const [monthBKey, setMonthBKey] = useState<string>(initialMonthB);
  const [filterTab, setFilterTab] = useState<'all' | 'income' | 'deduction'>('all');

  const recordA = useMemo(
    () => sortedRecords.find((r) => r.month === monthAKey) || sortedRecords[0],
    [sortedRecords, monthAKey]
  );
  const recordB = useMemo(
    () => sortedRecords.find((r) => r.month === monthBKey) || sortedRecords[1] || sortedRecords[0],
    [sortedRecords, monthBKey]
  );

  // Swap Month A and Month B
  const handleSwapMonths = () => {
    const temp = monthAKey;
    setMonthAKey(monthBKey);
    setMonthBKey(temp);
  };

  // Pre-configured priority ordering for income and deduction items for consistent display
  const incomePriority: Record<string, number> = {
    'Basic Pay': 1,
    'House Rent': 2,
    'Medical': 3,
    'Conveyance': 4,
    'Refreshment': 5,
    'Special': 6,
    'Utility': 7,
    'Festival Bonus': 8,
    'Dearness': 9,
    'Arrears': 10,
  };

  const deductionPriority: Record<string, number> = {
    'PF': 1,
    'Tax': 2,
    'Canteen': 3,
    'Welfare': 4,
    'Welfare Subs': 5,
    'Picnic': 6,
    'Stamps': 7,
    'Advanced': 8,
    'Interest PF': 9,
    'PF Loan': 10,
  };

  // --- INCOME COMPARISON ITEMS ---
  // Collect all income keys from both months and filter out any item that is 0 in BOTH months
  const incomeComparisonList = useMemo(() => {
    if (!recordA || !recordB) return [];

    const allIncomeKeys = Array.from(
      new Set([
        ...Object.keys(recordA.incomes || {}),
        ...Object.keys(recordB.incomes || {}),
      ])
    );

    return allIncomeKeys
      .map((key) => {
        const valA = Number(recordA.incomes?.[key] || 0);
        const valB = Number(recordB.incomes?.[key] || 0);
        const diff = valA - valB;
        const diffPercent =
          valB > 0
            ? Number(((diff / valB) * 100).toFixed(1))
            : valA > 0
            ? 100
            : 0;

        return {
          key,
          valA,
          valB,
          diff,
          diffPercent,
          maxVal: Math.max(valA, valB, 1),
        };
      })
      // CRITICAL REQUIREMENT: Filter out items where both months are 0 (e.g. Dearness, etc.)
      .filter((item) => item.valA > 0 || item.valB > 0)
      .sort((a, b) => {
        const pA = incomePriority[a.key] || 99;
        const pB = incomePriority[b.key] || 99;
        if (pA !== pB) return pA - pB;
        return b.valA - a.valA;
      });
  }, [recordA, recordB]);

  // --- DEDUCTION COMPARISON ITEMS ---
  // Collect all deduction keys from both months and filter out any item that is 0 in BOTH months
  const deductionComparisonList = useMemo(() => {
    if (!recordA || !recordB) return [];

    const allDeductionKeys = Array.from(
      new Set([
        ...Object.keys(recordA.deductions || {}),
        ...Object.keys(recordB.deductions || {}),
      ])
    );

    return allDeductionKeys
      .map((key) => {
        const valA = Number(recordA.deductions?.[key] || 0);
        const valB = Number(recordB.deductions?.[key] || 0);
        const diff = valA - valB;
        const diffPercent =
          valB > 0
            ? Number(((diff / valB) * 100).toFixed(1))
            : valA > 0
            ? 100
            : 0;

        return {
          key,
          valA,
          valB,
          diff,
          diffPercent,
          maxVal: Math.max(valA, valB, 1),
        };
      })
      // CRITICAL REQUIREMENT: Filter out items where both months are 0 (e.g. Advanced, PF Loan, etc.)
      .filter((item) => item.valA > 0 || item.valB > 0)
      .sort((a, b) => {
        const pA = deductionPriority[a.key] || 99;
        const pB = deductionPriority[b.key] || 99;
        if (pA !== pB) return pA - pB;
        return b.valA - a.valA;
      });
  }, [recordA, recordB]);

  // Overall totals diffs
  const grossDiff = (recordA?.gross || 0) - (recordB?.gross || 0);
  const grossDiffPct =
    recordB?.gross && recordB.gross > 0
      ? Number(((grossDiff / recordB.gross) * 100).toFixed(1))
      : 0;

  const dedDiff = (recordA?.deduction || 0) - (recordB?.deduction || 0);
  const dedDiffPct =
    recordB?.deduction && recordB.deduction > 0
      ? Number(((dedDiff / recordB.deduction) * 100).toFixed(1))
      : 0;

  const netDiff = (recordA?.net || 0) - (recordB?.net || 0);
  const netDiffPct =
    recordB?.net && recordB.net > 0
      ? Number(((netDiff / recordB.net) * 100).toFixed(1))
      : 0;

  if (salaryRecords.length < 2) {
    return (
      <div id="salary-comparison-screen" className="w-full flex flex-col pb-10">
        <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="comparison-back-btn"
              onClick={() => onNavigate('dashboard')}
              className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[17px] font-extrabold text-[#17211D] tracking-tight">
              Salary Comparison
            </h1>
          </div>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-center mt-12">
          <ArrowUpDown size={48} className="text-[#8A9791] mb-3" />
          <h2 className="text-base font-bold text-[#17211D]">
            {salaryRecords.length === 0 ? 'No Salary Records Available' : 'Need at least 2 Months to Compare'}
          </h2>
          <p className="text-xs text-[#6E7974] mt-1 max-w-xs">
            {salaryRecords.length === 0
              ? 'Add your monthly salary records to compare salary trends, allowances, and deductions side by side.'
              : 'You currently have 1 monthly record. Add another month’s salary to unlock side-by-side comparison analytics.'}
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

  return (
    <div id="salary-comparison-screen" className="w-full flex flex-col pb-10">
      {/* Top Sticky Header */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="comparison-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#17211D] tracking-tight leading-tight">
              Salary Comparison
            </h1>
            <span className="text-[10px] text-[#6E7974] font-medium block">
              Itemized Income & Deduction Analysis
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Month Selection Bar (Month A vs Month B with Centered Extra Small Swap Button Below) */}
        <div
          id="month-selectors-card"
          className="w-full bg-white rounded-2xl p-3.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-2.5"
        >
          <div className="grid grid-cols-2 gap-2 relative">
            {/* Month A Selector */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#008F5B]" />
                <label
                  htmlFor="select-month-a"
                  className="text-[10px] font-extrabold text-[#008F5B] uppercase tracking-wider"
                >
                  Primary Month
                </label>
              </div>
              <div className="relative">
                <select
                  id="select-month-a"
                  value={monthAKey}
                  onChange={(e) => setMonthAKey(e.target.value)}
                  className="w-full appearance-none bg-[#F5FAF7] hover:bg-[#EBF5F0] border border-[#E4ECE8] focus:border-[#008F5B] focus:ring-1 focus:ring-[#008F5B] text-[#17211D] text-[12px] font-black py-2 pl-2.5 pr-6 rounded-xl cursor-pointer transition-all"
                >
                  {sortedRecords.map((r) => (
                    <option key={`a-${r.month}`} value={r.month}>
                      {r.monthLabel}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7974] pointer-events-none"
                />
              </div>
            </div>

            {/* Month B Selector */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                <label
                  htmlFor="select-month-b"
                  className="text-[10px] font-extrabold text-[#0284C7] uppercase tracking-wider"
                >
                  Compare With
                </label>
              </div>
              <div className="relative">
                <select
                  id="select-month-b"
                  value={monthBKey}
                  onChange={(e) => setMonthBKey(e.target.value)}
                  className="w-full appearance-none bg-[#F5FAF7] hover:bg-[#EBF5F0] border border-[#E4ECE8] focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] text-[#17211D] text-[12px] font-black py-2 pl-2.5 pr-6 rounded-xl cursor-pointer transition-all"
                >
                  {sortedRecords.map((r) => (
                    <option key={`b-${r.month}`} value={r.month}>
                      {r.monthLabel}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7974] pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Centered Extra-Small Swap Button Located Below the Selectors */}
          <div className="w-full flex items-center justify-center pt-0.5">
            <button
              type="button"
              id="swap-months-center-btn"
              onClick={handleSwapMonths}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5FAF7] hover:bg-[#E9F7F1] text-[#008F5B] text-[9.5px] font-extrabold tracking-wide uppercase transition-all border border-[#008F5B]/30 hover:border-[#008F5B]/60 shadow-2xs active:scale-95 cursor-pointer"
              title="Swap Primary and Compared Months"
            >
              <ArrowUpDown size={11} className="stroke-[2.5] text-[#008F5B]" />
              <span>Swipe Months</span>
            </button>
          </div>
        </div>

        {/* Executive Net Salary Growth & Summary Card (Themed with Clean White and PayFlow Emerald Green) */}
        <div
          id="executive-summary-card"
          className="w-full bg-white rounded-2xl p-4 sm:p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3.5 relative overflow-hidden"
        >
          {/* Header Row of the Summary Card */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE8] relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
              <div>
                <h2 className="text-[13.5px] font-black text-[#17211D] leading-tight">
                  Net Salary Growth & Summary
                </h2>
                <span className="text-[10px] text-[#6E7974] font-medium block">
                  {recordA?.monthLabel?.split(' ')[0]} x {recordB?.monthLabel?.split(' ')[0]} Comparative Overview
                </span>
              </div>
            </div>
          </div>

          {/* 3 Metrics Cards */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 relative z-10">
            {/* 1. NET PAYABLE CARD */}
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F5FAF7] border border-[#008F5B]/30 shadow-[0_2px_8px_rgba(0,143,91,0.04)] flex flex-col justify-between relative overflow-hidden group">
              {/* Theme Watermark Icon (Net / Wallet) - Top Right like KPI cards */}
              <div className="absolute top-1.5 right-1.5 text-[#008F5B]/[0.08] group-hover:text-[#008F5B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                <Wallet size={32} strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#008F5B] uppercase tracking-wider block leading-tight">
                  NET PAYABLE
                </span>
              </div>

              <div className="mt-1 relative z-10">
                <strong className="block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black text-[#008F5B] tracking-tight leading-tight whitespace-nowrap">
                  <BDT amount={recordA?.net || 0} decimals={2} symbolClassName="text-[1.15em] font-black text-[#008F5B] mr-0.5" />
                </strong>

                {/* Dynamic Month label (e.g. Jan:, Jun:) for recordB with .00 cleanly fitted on 390dp */}
                <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                  <span className="text-[#6E7974] font-bold shrink-0">
                    {(recordB?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                  </span>
                  <BDT
                    amount={recordB?.net || 0}
                    decimals={2}
                    symbolClassName="text-[1.12em] font-extrabold text-[#17211D] mr-0.5"
                    className="font-bold text-[#17211D]"
                  />
                </div>
              </div>

              {/* Visual Micro Progress Comparison */}
              <div className="mt-1.5 w-full h-1 bg-[#E2EBE6] rounded-full overflow-hidden relative z-10">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        recordB?.net ? Math.round(((recordA?.net || 0) / Math.max(recordA?.net || 1, recordB?.net || 1)) * 100) : 100
                      )
                    )}%`,
                  }}
                  className="h-full bg-gradient-to-r from-[#008F5B] to-[#00B377] rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* 2. GROSS AMOUNT CARD */}
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#F6FAF8] border border-[#D8E6DF] shadow-[0_2px_8px_rgba(23,33,29,0.03)] flex flex-col justify-between relative overflow-hidden group">
              {/* Theme Watermark Icon (Gross / Landmark) - Top Right like KPI cards */}
              <div className="absolute top-1.5 right-1.5 text-[#17211D]/[0.07] group-hover:text-[#008F5B]/[0.12] transition-all duration-300 pointer-events-none group-hover:scale-105">
                <Landmark size={32} strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#5C6E66] uppercase tracking-wider block leading-tight">
                  GROSS AMOUNT
                </span>
              </div>

              <div className="mt-1 relative z-10">
                <strong className="block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black text-[#17211D] tracking-tight leading-tight whitespace-nowrap">
                  <BDT amount={recordA?.gross || 0} decimals={2} symbolClassName="text-[1.15em] font-black text-[#17211D] mr-0.5" />
                </strong>

                {/* Dynamic Month label (e.g. Jan:, Jun:) for recordB with .00 cleanly fitted on 390dp */}
                <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#4A5550] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                  <span className="text-[#6E7974] font-bold shrink-0">
                    {(recordB?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                  </span>
                  <BDT
                    amount={recordB?.gross || 0}
                    decimals={2}
                    symbolClassName="text-[1.12em] font-extrabold text-[#17211D] mr-0.5"
                    className="font-bold text-[#17211D]"
                  />
                </div>
              </div>

              {/* Visual Micro Progress Comparison */}
              <div className="mt-1.5 w-full h-1 bg-[#E2EBE6] rounded-full overflow-hidden relative z-10">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        recordB?.gross ? Math.round(((recordA?.gross || 0) / Math.max(recordA?.gross || 1, recordB?.gross || 1)) * 100) : 100
                      )
                    )}%`,
                  }}
                  className="h-full bg-gradient-to-r from-[#008F5B] to-[#00B377] rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* 3. TOTAL DEDUCTION CARD */}
            <div className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FFF6F6] border border-[#FDCFD4] shadow-[0_2px_8px_rgba(216,59,59,0.03)] flex flex-col justify-between relative overflow-hidden group">
              {/* Theme Watermark Icon (Deduction / ShieldAlert) - Top Right like KPI cards */}
              <div className="absolute top-1.5 right-1.5 text-[#D83B3B]/[0.08] group-hover:text-[#D83B3B]/[0.15] transition-all duration-300 pointer-events-none group-hover:scale-105">
                <ShieldAlert size={32} strokeWidth={1.5} />
              </div>

              <div className="relative z-10">
                <span className="text-[8.5px] sm:text-[9.5px] font-black text-[#D83B3B] uppercase tracking-wider block leading-tight">
                  TOTAL DEDUCT
                </span>
              </div>

              <div className="mt-1 relative z-10">
                <strong className="block text-[10px] sm:text-[12px] min-[410px]:text-[12.5px] font-black text-[#D83B3B] tracking-tight leading-tight whitespace-nowrap">
                  <BDT amount={recordA?.deduction || 0} decimals={2} symbolClassName="text-[1.15em] font-black text-[#D83B3B] mr-0.5" />
                </strong>

                {/* Dynamic Month label (e.g. Jan:, Jun:) for recordB with .00 cleanly fitted on 390dp */}
                <div className="mt-0.5 text-[8px] min-[370px]:text-[8.5px] min-[410px]:text-[9.5px] sm:text-[10px] font-bold text-[#8A1A1A] flex items-center gap-0.5 whitespace-nowrap tracking-tight leading-tight">
                  <span className="text-[#D83B3B]/80 font-bold shrink-0">
                    {(recordB?.monthLabel?.split(' ')[0]?.slice(0, 3) || 'Prev') + ':'}
                  </span>
                  <BDT
                    amount={recordB?.deduction || 0}
                    decimals={2}
                    symbolClassName="text-[1.12em] font-extrabold text-[#D83B3B] mr-0.5"
                    className="font-bold text-[#D83B3B]"
                  />
                </div>
              </div>

              {/* Visual Micro Progress Comparison */}
              <div className="mt-1.5 w-full h-1 bg-[#FEE2E2] rounded-full overflow-hidden relative z-10">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        10,
                        recordB?.deduction ? Math.round(((recordA?.deduction || 0) / Math.max(recordA?.deduction || 1, recordB?.deduction || 1)) * 100) : 100
                      )
                    )}%`,
                  }}
                  className="h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444] rounded-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: Month Comparison Label on Left and Net Growth Diff on Right */}
          <div className="w-full flex items-center justify-between pt-1 relative z-10">
            <span className="text-[10.5px] text-[#6E7974] font-semibold tracking-wide">
              {recordA?.monthLabel?.split(' ')[0]} vs {recordB?.monthLabel?.split(' ')[0]} Difference
            </span>

            <div className="flex items-center gap-1 font-extrabold text-[10.5px]">
              {netDiff >= 0 ? (
                <ArrowUpRight size={13} className="text-[#008F5B] stroke-[2.5]" />
              ) : (
                <ArrowDownRight size={13} className="text-[#D83B3B] stroke-[2.5]" />
              )}
              <span className={netDiff >= 0 ? 'text-[#008F5B] tracking-wide' : 'text-[#D83B3B] tracking-wide'}>
                {netDiff >= 0 ? '+' : ''}
                {formatBDT(netDiff)} ({netDiffPct >= 0 ? '+' : ''}
                {netDiffPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Section Filter Switcher (All / Income / Deduction) */}
        <div
          id="comparison-section-tabs"
          className="w-full bg-white rounded-2xl border border-[#008F5B] overflow-hidden flex items-stretch shadow-2xs"
        >
          {/* Tab 1: All Items */}
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center cursor-pointer transition-all ${
              filterTab === 'all'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              All Items
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-[#008F5B] self-stretch shrink-0" />

          {/* Tab 2: Income Only */}
          <button
            type="button"
            onClick={() => setFilterTab('income')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1 cursor-pointer transition-all ${
              filterTab === 'income'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <PlusCircle
              size={13}
              className={filterTab === 'income' ? 'text-[#008F5B]' : 'text-[#6E7974]'}
            />
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              Income
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-px bg-[#008F5B] self-stretch shrink-0" />

          {/* Tab 3: Deduction Only */}
          <button
            type="button"
            onClick={() => setFilterTab('deduction')}
            className={`flex-1 py-2.5 sm:py-3 px-2 flex items-center justify-center gap-1 cursor-pointer transition-all ${
              filterTab === 'deduction'
                ? 'bg-[#E8F7F0] text-[#008F5B] font-bold'
                : 'bg-white text-[#17211D] font-bold hover:bg-[#F5FAF7]'
            }`}
          >
            <MinusCircle
              size={13}
              className={filterTab === 'deduction' ? 'text-[#008F5B]' : 'text-[#6E7974]'}
            />
            <span className="text-[12.5px] sm:text-[13px] leading-tight">
              Deduction
            </span>
          </button>
        </div>

        {/* 1. INCOME COMPARISON SECTION */}
        {(filterTab === 'all' || filterTab === 'income') && (
          <div
            id="income-comparison-section"
            className="w-full bg-white rounded-2xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3.5"
          >
            {/* Header with Title & Legend */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE8]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                  <PlusCircle size={16} />
                </div>
                <div>
                  <h2 className="text-[14px] font-black text-[#17211D]">
                    Income Comparison
                  </h2>
                  <span className="text-[10px] text-[#6E7974] font-medium block">
                    {incomeComparisonList.length} Active Earnings Entries
                  </span>
                </div>
              </div>

              {/* Color Indicators */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B]" />
                  <span className="text-[10px] font-bold text-[#17211D]">
                    {recordA?.monthLabel?.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                  <span className="text-[10px] font-bold text-[#6E7974]">
                    {recordB?.monthLabel?.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Income Comparison List */}
            <div className="flex flex-col gap-3">
              {incomeComparisonList.length === 0 ? (
                <div className="p-4 text-center text-[12px] text-[#6E7974]">
                  No income entries found to compare.
                </div>
              ) : (
                incomeComparisonList.map((item) => {
                  const maxVal = Math.max(item.valA, item.valB, 1);
                  const pctA = Math.round((item.valA / maxVal) * 100);
                  const pctB = Math.round((item.valB / maxVal) * 100);
                  const isPositive = item.diff > 0;
                  const isNegative = item.diff < 0;

                  return (
                    <div
                      key={`inc-${item.key}`}
                      className="w-full p-3 rounded-xl bg-[#F9FCFA] border border-[#E4ECE8] hover:border-[#008F5B]/30 hover:bg-[#F2F9F5] transition-all flex flex-col gap-2"
                    >
                      {/* Top Row: Item Name & Growth Pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-black text-[#17211D]">
                            {item.key}
                          </span>
                        </div>

                        {/* Diff Indicator */}
                        {item.diff === 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#F0F4F2] text-[#6E7974] text-[9.5px] font-bold">
                            0.0% (Equal)
                          </span>
                        ) : (
                          <div
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-black ${
                              isPositive
                                ? 'bg-[#E9F7F1] text-[#008F5B]'
                                : 'bg-[#FDF2F2] text-[#D83B3B]'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            <span>
                              {isPositive ? '+' : ''}
                              {formatBDT(item.diff)} ({isPositive ? '+' : ''}
                              {item.diffPercent}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Amounts Display Row */}
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-[#008F5B] uppercase">
                            {recordA?.monthLabel?.split(' ')[0]}:
                          </span>
                          <strong className="text-[12px] font-black text-[#008F5B]">
                            {formatBDT(item.valA)}
                          </strong>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-[#0284C7] uppercase">
                            {recordB?.monthLabel?.split(' ')[0]}:
                          </span>
                          <strong className="text-[12px] font-black text-[#0284C7]">
                            {formatBDT(item.valB)}
                          </strong>
                        </div>
                      </div>

                      {/* Graphical System: High-precision Dual Comparative Bars */}
                      <div className="flex flex-col gap-1 pt-0.5">
                        {/* Month A Bar */}
                        <div className="w-full flex items-center gap-2">
                          <span className="text-[8.5px] font-bold text-[#008F5B] w-6 text-right shrink-0">
                            A
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-[#E4ECE8] overflow-hidden">
                            <div
                              style={{ width: `${pctA}%` }}
                              className="h-full bg-gradient-to-r from-[#008F5B] to-[#00C980] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* Month B Bar */}
                        <div className="w-full flex items-center gap-2">
                          <span className="text-[8.5px] font-bold text-[#0284C7] w-6 text-right shrink-0">
                            B
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-[#E4ECE8] overflow-hidden">
                            <div
                              style={{ width: `${pctB}%` }}
                              className="h-full bg-gradient-to-r from-[#0284C7] to-[#38BDF8] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. DEDUCTION COMPARISON SECTION */}
        {(filterTab === 'all' || filterTab === 'deduction') && (
          <div
            id="deduction-comparison-section"
            className="w-full bg-white rounded-2xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3.5"
          >
            {/* Header with Title & Legend */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E4ECE8]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FDF2F2] text-[#D83B3B] flex items-center justify-center">
                  <MinusCircle size={16} />
                </div>
                <div>
                  <h2 className="text-[14px] font-black text-[#17211D]">
                    Deduction Comparison
                  </h2>
                  <span className="text-[10px] text-[#6E7974] font-medium block">
                    {deductionComparisonList.length} Active Deduction Entries
                  </span>
                </div>
              </div>

              {/* Color Indicators */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B]" />
                  <span className="text-[10px] font-bold text-[#17211D]">
                    {recordA?.monthLabel?.split(' ')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span className="text-[10px] font-bold text-[#6E7974]">
                    {recordB?.monthLabel?.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Deduction Comparison List */}
            <div className="flex flex-col gap-3">
              {deductionComparisonList.length === 0 ? (
                <div className="p-4 text-center text-[12px] text-[#6E7974]">
                  No deduction entries found to compare.
                </div>
              ) : (
                deductionComparisonList.map((item) => {
                  const maxVal = Math.max(item.valA, item.valB, 1);
                  const pctA = Math.round((item.valA / maxVal) * 100);
                  const pctB = Math.round((item.valB / maxVal) * 100);
                  const isIncreased = item.diff > 0;
                  const isDecreased = item.diff < 0;

                  return (
                    <div
                      key={`ded-${item.key}`}
                      className="w-full p-3 rounded-xl bg-[#FDFBFB] border border-[#E4ECE8] hover:border-[#D83B3B]/30 hover:bg-[#FDF6F6] transition-all flex flex-col gap-2"
                    >
                      {/* Top Row: Item Name & Growth Pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12.5px] font-black text-[#17211D]">
                            {item.key}
                          </span>
                        </div>

                        {/* Diff Indicator */}
                        {item.diff === 0 ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#F0F4F2] text-[#6E7974] text-[9.5px] font-bold">
                            0.0% (Equal)
                          </span>
                        ) : (
                          <div
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-black ${
                              isIncreased
                                ? 'bg-[#FDF2F2] text-[#D83B3B]'
                                : 'bg-[#E9F7F1] text-[#008F5B]'
                            }`}
                          >
                            {isIncreased ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            <span>
                              {isIncreased ? '+' : ''}
                              {formatBDT(item.diff)} ({isIncreased ? '+' : ''}
                              {item.diffPercent}%)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Amounts Display Row */}
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-[#D83B3B] uppercase">
                            {recordA?.monthLabel?.split(' ')[0]}:
                          </span>
                          <strong className="text-[12px] font-black text-[#D83B3B]">
                            {formatBDT(item.valA)}
                          </strong>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[9.5px] font-bold text-[#F97316] uppercase">
                            {recordB?.monthLabel?.split(' ')[0]}:
                          </span>
                          <strong className="text-[12px] font-black text-[#F97316]">
                            {formatBDT(item.valB)}
                          </strong>
                        </div>
                      </div>

                      {/* Graphical System: High-precision Dual Comparative Bars */}
                      <div className="flex flex-col gap-1 pt-0.5">
                        {/* Month A Bar */}
                        <div className="w-full flex items-center gap-2">
                          <span className="text-[8.5px] font-bold text-[#D83B3B] w-6 text-right shrink-0">
                            A
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-[#E4ECE8] overflow-hidden">
                            <div
                              style={{ width: `${pctA}%` }}
                              className="h-full bg-gradient-to-r from-[#D83B3B] to-[#F87171] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* Month B Bar */}
                        <div className="w-full flex items-center gap-2">
                          <span className="text-[8.5px] font-bold text-[#F97316] w-6 text-right shrink-0">
                            B
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-[#E4ECE8] overflow-hidden">
                            <div
                              style={{ width: `${pctB}%` }}
                              className="h-full bg-gradient-to-r from-[#F97316] to-[#FDBA74] rounded-full transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
