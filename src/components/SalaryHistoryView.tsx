import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  ArrowRight,
  TrendingUp,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface SalaryHistoryViewProps {
  salaryRecords: MonthSalaryRecord[];
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SalaryHistoryView: React.FC<SalaryHistoryViewProps> = ({
  salaryRecords,
  activeMonth,
  onSelectMonth,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = salaryRecords.filter((r) =>
    r.monthLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Highest salary record
  const highestSalary = Math.max(...salaryRecords.map((r) => r.net));

  return (
    <div id="salary-history-screen" className="w-full flex flex-col pb-8">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white/95 backdrop-blur-md border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="history-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer shadow-2xs"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold text-[#17211D] tracking-tight leading-tight">
              Salary History
            </h1>
            <span className="text-[10px] text-[#6E7974] font-medium block">
              {salaryRecords.length} Disbursed Months
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Modern Search Field */}
        <div className="relative w-full">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9791]"
          />
          <input
            type="text"
            id="history-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search month (e.g. August 2026)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D7E0DC] rounded-2xl text-xs text-[#17211D] placeholder:text-[#8A9791] focus:outline-hidden focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/20 transition-all shadow-2xs"
          />
        </div>

        {/* Salary Records List */}
        <div className="flex flex-col gap-3">
          {filteredRecords.map((r, idx) => {
            const isHighest = r.net === highestSalary;
            const isLatest = idx === 0;

            return (
              <button
                key={r.month}
                type="button"
                id={`history-card-${r.month}`}
                onClick={() => {
                  onSelectMonth(r.month);
                  onNavigate('details');
                }}
                className={`w-full rounded-[22px] p-4 text-left border transition-all duration-200 cursor-pointer flex flex-col gap-2 group ${
                  r.month === activeMonth
                    ? 'bg-gradient-to-br from-white via-[#F4FAF7] to-[#E8F7F0] border-[#008F5B]/50 shadow-[0_8px_20px_rgba(0,143,91,0.08)]'
                    : 'bg-white border-[#E4ECE8] hover:border-[#008F5B]/30 hover:shadow-xs shadow-[0_2px_10px_rgba(23,33,29,0.02)]'
                }`}
              >
                {/* Header: Month & Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center font-bold text-xs">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-extrabold text-[#17211D]">
                        {r.monthLabel}
                      </h3>
                      <span className="text-[10px] text-[#6E7974] flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-[#008F5B]" />
                        Disbursed on 1st of month
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLatest && (
                      <span className="text-[9px] bg-[#008F5B] text-white font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                        CURRENT
                      </span>
                    )}
                    {isHighest && !isLatest && (
                      <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] font-extrabold px-2 py-0.5 rounded-full border border-[#FDE68A]">
                        PEAK
                      </span>
                    )}
                    <ChevronRight size={16} className="text-[#8A9791] group-hover:text-[#008F5B] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Amount Row */}
                <div className="pt-2 border-t border-[#F0F4F2] flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#6E7974] uppercase tracking-wider block">
                      NET TAKE-HOME
                    </span>
                    <strong className="text-[18px] font-black text-[#008F5B] block leading-tight">
                      {formatBDT(r.net)}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#6E7974] block">
                      Gross: <strong className="text-[#17211D]">{formatBDT(r.gross)}</strong>
                    </span>
                    <span className="text-[10px] text-[#D83B3B] block">
                      Deduct: -{formatBDT(r.deduction)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
