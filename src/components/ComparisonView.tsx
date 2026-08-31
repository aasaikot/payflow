import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface ComparisonViewProps {
  salaryRecords: MonthSalaryRecord[];
  onNavigate: (screen: ScreenType) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  salaryRecords,
  onNavigate,
}) => {
  const [timeframe, setTimeframe] = useState<'3' | '6' | '12'>('6');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const displayCount = parseInt(timeframe, 10);
  const records = salaryRecords.slice(0, displayCount);
  // Sort chronologically for chart
  const chronRecords = [...records].reverse();

  // Compute stats
  const nets = records.map((r) => r.net);
  const highestNetRecord = records.reduce((prev, curr) =>
    curr.net > prev.net ? curr : prev, records[0] || { net: 0, monthLabel: '-' });
  const lowestNetRecord = records.reduce((prev, curr) =>
    curr.net < prev.net ? curr : prev, records[0] || { net: 0, monthLabel: '-' });
  const avgNet =
    nets.length > 0
      ? Math.round(nets.reduce((a, b) => a + b, 0) / nets.length)
      : 0;

  // Max value for bar scaling (up to 150k)
  const maxBarValue = 150000;

  return (
    <div id="comparison-screen" className="w-full flex flex-col pb-8">
      {/* Top Header */}
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
            <span className="text-[10.5px] text-[#6E7974] font-medium block">
              Multi-Month Trend Analysis
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Sleek Segmented Timeframe Switcher (3 Months / 6 Months / 12 Months) */}
        <div
          id="comparison-segmented-timeframe"
          className="w-full bg-[#EEF4F1] p-1.5 rounded-2xl border border-[#D7E0DC] grid grid-cols-3 gap-1 shadow-inner"
        >
          {(['3', '6', '12'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                timeframe === t
                  ? 'bg-white text-[#008F5B] shadow-sm ring-1 ring-[#008F5B]/20 scale-[1.02]'
                  : 'text-[#6E7974] hover:text-[#17211D] hover:bg-white/40'
              }`}
            >
              <span>Last {t} Months</span>
            </button>
          ))}
        </div>

        {/* 3 Summary Metric Cards (Highest / Lowest / Average) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Highest Net */}
          <div className="p-3 rounded-xl bg-white border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#6E7974] uppercase tracking-wider">
                PEAK NET
              </span>
              <Award size={13} className="text-[#008F5B]" />
            </div>
            <strong className="text-[13px] font-black text-[#008F5B] mt-1 truncate">
              {formatBDT(highestNetRecord.net)}
            </strong>
            <span className="text-[9px] text-[#6E7974] font-medium mt-0.5 truncate">
              {highestNetRecord.monthLabel.split(' ')[0]}
            </span>
          </div>

          {/* Lowest Net */}
          <div className="p-3 rounded-xl bg-white border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#6E7974] uppercase tracking-wider">
                LOWEST NET
              </span>
              <ArrowDownRight size={13} className="text-[#D83B3B]" />
            </div>
            <strong className="text-[13px] font-black text-[#D83B3B] mt-1 truncate">
              {formatBDT(lowestNetRecord.net)}
            </strong>
            <span className="text-[9px] text-[#6E7974] font-medium mt-0.5 truncate">
              {lowestNetRecord.monthLabel.split(' ')[0]}
            </span>
          </div>

          {/* Average Net */}
          <div className="p-3 rounded-xl bg-white border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#6E7974] uppercase tracking-wider">
                AVG NET
              </span>
              <TrendingUp size={13} className="text-[#17211D]" />
            </div>
            <strong className="text-[13px] font-black text-[#17211D] mt-1 truncate">
              {formatBDT(avgNet)}
            </strong>
            <span className="text-[9px] text-[#6E7974] font-medium mt-0.5 truncate">
              Monthly Avg
            </span>
          </div>
        </div>

        {/* Dual Interactive Bar & Growth Chart Card */}
        <div
          id="comparison-chart-card"
          className="w-full bg-white rounded-xl p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          {/* Chart Header & Legend */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <BarChart3 size={15} className="text-[#008F5B]" />
              <span className="text-[13px] font-extrabold text-[#17211D]">
                Income vs Deduction Trend
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008F5B]" />
                <span className="text-[10px] font-bold text-[#17211D]">Gross</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D83B3B]" />
                <span className="text-[10px] font-bold text-[#17211D]">Deductions</span>
              </div>
            </div>
          </div>

          {/* Custom Grouped Bar Visualizer */}
          <div className="w-full h-48 flex items-end justify-between gap-1.5 pt-4 pb-2 px-1 relative">
            {/* Grid Line Guides */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
              <div className="border-b border-[#E4ECE8] w-full flex justify-end text-[8px] text-[#6E7974] pr-1">150K</div>
              <div className="border-b border-[#E4ECE8] w-full flex justify-end text-[8px] text-[#6E7974] pr-1">100K</div>
              <div className="border-b border-[#E4ECE8] w-full flex justify-end text-[8px] text-[#6E7974] pr-1">50K</div>
              <div className="border-b border-[#E4ECE8] w-full flex justify-end text-[8px] text-[#6E7974] pr-1">0</div>
            </div>

            {/* Monthly Columns */}
            {chronRecords.map((r, i) => {
              const incomeHeight = Math.max(12, Math.round((r.gross / maxBarValue) * 100));
              const dedHeight = Math.max(10, Math.round((r.deduction / maxBarValue) * 100));
              const isCurrent = i === chronRecords.length - 1;
              const shortMonth = r.monthLabel.substring(0, 3);
              const isHovered = hoveredMonth === r.month;

              return (
                <div
                  key={r.month}
                  onMouseEnter={() => setHoveredMonth(r.month)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="flex-1 flex flex-col items-center gap-1 z-10 cursor-pointer group"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute top-1 bg-[#17211D] text-white text-[10px] px-2.5 py-1 rounded-lg shadow-xl font-bold whitespace-nowrap z-30">
                      {r.monthLabel}: Net {formatBDT(r.net)}
                    </div>
                  )}

                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Gross Bar */}
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className={`w-3.5 sm:w-4 rounded-t-md transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-[#006B44] to-[#00C980] shadow-xs'
                          : 'bg-[#008F5B]/85 group-hover:bg-[#008F5B]'
                      }`}
                    />
                    {/* Deduction Bar */}
                    <div
                      style={{ height: `${dedHeight}%` }}
                      className={`w-3.5 sm:w-4 rounded-t-md transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-t from-[#8C1B1B] to-[#FF4D4D]'
                          : 'bg-[#D83B3B]/80 group-hover:bg-[#D83B3B]'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${
                      isCurrent ? 'text-[#008F5B]' : 'text-[#6E7974]'
                    }`}
                  >
                    {shortMonth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Responsive Month-By-Month Breakdown Cards (Zero Overflow) */}
        <div
          id="comparison-table-card"
          className="w-full bg-white rounded-xl p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)] flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-[#008F5B]" />
              <h3 className="text-[13.5px] font-black text-[#17211D]">
                Month-By-Month Breakdown
              </h3>
            </div>
            <span className="text-[10.5px] font-bold text-[#6E7974]">
              {records.length} Statements
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {records.map((r, idx) => {
              const prev = idx < records.length - 1 ? records[idx + 1] : null;
              const isGrowing = prev ? r.net >= prev.net : true;
              const diff = prev ? r.net - prev.net : 0;
              const diffPercent = prev ? Math.abs(Math.round((diff / prev.net) * 100)) : null;

              const grossRatio = Math.round((r.gross / (r.gross + r.deduction)) * 100);

              return (
                <div
                  key={r.month}
                  className="w-full p-3 rounded-lg bg-[#F9FCFA] border border-[#E4ECE8] hover:border-[#008F5B]/30 hover:bg-[#F3F9F6] transition-all flex flex-col gap-2"
                >
                  {/* Top Row: Month, Growth Pill & Net Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px] font-black text-[#17211D] truncate">
                        {r.monthLabel}
                      </span>
                      {diffPercent !== null ? (
                        <div
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9.5px] font-black ${
                            isGrowing
                              ? 'bg-[#E9F7F1] text-[#008F5B]'
                              : 'bg-[#FDF2F2] text-[#D83B3B]'
                          }`}
                        >
                          {isGrowing ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          <span>{isGrowing ? '+' : '-'}{diffPercent}%</span>
                        </div>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F0F4F2] text-[#6E7974] text-[9.5px] font-bold">
                          Baseline
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-[#6E7974] font-bold block uppercase tracking-wider">
                        NET PAID
                      </span>
                      <strong className="text-[14px] font-black text-[#008F5B]">
                        {formatBDT(r.net)}
                      </strong>
                    </div>
                  </div>

                  {/* Micro Visualizer Ratio Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#E4ECE8] overflow-hidden flex">
                    <div
                      style={{ width: `${grossRatio}%` }}
                      className="bg-[#008F5B] h-full"
                      title={`Gross Share: ${grossRatio}%`}
                    />
                    <div
                      style={{ width: `${100 - grossRatio}%` }}
                      className="bg-[#D83B3B] h-full"
                      title={`Deduction Share: ${100 - grossRatio}%`}
                    />
                  </div>

                  {/* Bottom Meta: Gross & Deduction figures */}
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#6E7974]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008F5B]" />
                      <span>Gross: <strong className="text-[#17211D] font-bold">{formatBDT(r.gross)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D83B3B]" />
                      <span>Ded: <strong className="text-[#D83B3B] font-bold">{formatBDT(r.deduction)}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
