import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Building,
  Shield,
  Layers,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface SalaryDetailsViewProps {
  record: MonthSalaryRecord;
  onNavigate: (screen: ScreenType) => void;
  onEditMonth: (month: string) => void;
}

export const SalaryDetailsView: React.FC<SalaryDetailsViewProps> = ({
  record,
  onNavigate,
  onEditMonth,
}) => {
  const [selectedTab, setSelectedTab] = useState<'income' | 'deduction'>('income');
  const [copied, setCopied] = useState(false);

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

  const incomeEntries = Object.entries(record.incomes || {});
  const deductionEntries = Object.entries(record.deductions || {});

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
        {/* Dynamic High-Impact Hero Card */}
        <div
          id="details-hero-card"
          className={`w-full rounded-[26px] p-5 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${
            isIncome
              ? 'bg-gradient-to-br from-[#04281E] via-[#054C37] to-[#008F5B] shadow-[0_16px_36px_rgba(0,143,91,0.28)]'
              : 'bg-gradient-to-br from-[#5E0C0C] via-[#8C1B1B] to-[#D83B3B] shadow-[0_16px_36px_rgba(216,59,59,0.28)]'
          }`}
        >
          {/* Ambient Glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute right-4 top-4 text-white/15 pointer-events-none">
            {isIncome ? <Shield size={50} strokeWidth={1.2} /> : <CreditCard size={50} strokeWidth={1.2} />}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">
              {record.monthLabel}
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold">
              {isIncome ? 'Gross & Allowances' : 'Deductions & Taxes'}
            </span>
          </div>

          <div className="mt-2.5">
            <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-wider block">
              {isIncome ? 'TOTAL NET SALARY' : 'TOTAL DEDUCTION AMOUNT'}
            </span>
            <strong className="text-[28px] font-black text-white leading-tight tracking-tight block mt-0.5">
              {isIncome ? formatBDT(net) : formatBDT(deduction)}
            </strong>
          </div>

          {/* Quick Sub-Stats Strip */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-white/70 text-[10px] font-medium block">Gross Earnings</span>
              <strong className="text-white font-bold">{formatBDT(gross)}</strong>
            </div>
            <div className="text-right">
              <span className="text-white/70 text-[10px] font-medium block">Net Take-Home</span>
              <strong className="text-white font-bold">{formatBDT(net)}</strong>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Income vs Deduction) */}
        <div
          id="details-tab-switcher"
          className="w-full flex items-center bg-[#EAEFEA]/80 p-1 rounded-2xl border border-[#D7E0DC] shadow-inner"
        >
          <button
            type="button"
            id="tab-income-btn"
            onClick={() => setSelectedTab('income')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
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
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
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
          className="w-full bg-white rounded-[24px] p-4.5 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
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
          className="w-full py-3.5 rounded-[20px] bg-white border border-[#D7E0DC] hover:border-[#008F5B] text-xs font-extrabold text-[#008F5B] hover:bg-[#E9F7F1] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
        >
          <Edit size={14} />
          <span>Edit {record.monthLabel} Figures</span>
        </button>
      </div>
    </div>
  );
};
