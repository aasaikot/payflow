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
  Trash2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType, UserProfileData } from '../types';
import { formatBDT } from '../mockData';
import { BDT } from './BDT';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { exportSalaryToCSV } from '../utils/csvExport';

interface SalaryHistoryViewProps {
  salaryRecords: MonthSalaryRecord[];
  userProfile?: UserProfileData;
  activeMonth: string;
  onSelectMonth: (month: string) => void;
  onNavigate: (screen: ScreenType) => void;
  onDeleteRecord?: (month: string) => Promise<void> | void;
}

export const SalaryHistoryView: React.FC<SalaryHistoryViewProps> = ({
  salaryRecords,
  userProfile,
  activeMonth,
  onSelectMonth,
  onNavigate,
  onDeleteRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<MonthSalaryRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredRecords = salaryRecords.filter((r) =>
    r.monthLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Highest salary record
  const highestSalary = salaryRecords.length > 0 ? Math.max(...salaryRecords.map((r) => r.net)) : 0;

  const handleConfirmDelete = async (month: string) => {
    if (!onDeleteRecord) return;
    setIsDeleting(true);
    try {
      await onDeleteRecord(month);
      setRecordToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    exportSalaryToCSV(salaryRecords, userProfile);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div id="salary-history-screen" className="w-full flex flex-col pb-8">
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationModal
        isOpen={Boolean(recordToDelete)}
        record={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

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

        {/* Excel / CSV Export Button */}
        {salaryRecords.length > 0 && (
          <button
            type="button"
            id="export-salary-excel-btn"
            onClick={handleExportCSV}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              exportSuccess
                ? 'bg-[#008F5B] text-white border-[#008F5B]'
                : 'bg-[#E8F7F0] text-[#008F5B] border-[#C5EBDB] hover:bg-[#D5F2E4]'
            }`}
            title="Export all records to Excel / CSV spreadsheet"
          >
            {exportSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>Exported!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={14} />
                <span>Export Excel</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* Modern Search Field */}
        {salaryRecords.length > 0 && (
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D7E0DC] rounded-xl text-xs text-[#17211D] placeholder:text-[#8A9791] focus:outline-hidden focus:border-[#008F5B] focus:ring-2 focus:ring-[#008F5B]/20 transition-all shadow-2xs"
            />
          </div>
        )}

        {/* Salary Records List */}
        <div className="flex flex-col gap-3">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((r, idx) => {
              const isHighest = r.net === highestSalary;
              const isLatest = idx === 0;

              return (
                <div
                  key={r.month}
                  role="button"
                  tabIndex={0}
                  id={`history-card-${r.month}`}
                  onClick={() => {
                    onSelectMonth(r.month);
                    onNavigate('details');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectMonth(r.month);
                      onNavigate('details');
                    }
                  }}
                  className={`w-full rounded-xl p-4 text-left border transition-all duration-200 cursor-pointer flex flex-col gap-2 group ${
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

                      {/* Card Delete Action */}
                      <button
                        type="button"
                        id={`delete-history-${r.month}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setRecordToDelete(r);
                        }}
                        title={`Delete ${r.monthLabel} entry`}
                        className="p-1.5 rounded-lg text-[#9AA8A1] hover:text-[#D83B3B] hover:bg-[#FFF0F0] active:scale-95 transition-all cursor-pointer"
                        aria-label={`Delete ${r.monthLabel}`}
                      >
                        <Trash2 size={15} />
                      </button>

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
                        <BDT amount={r.net} symbolClassName="text-[1.2em] font-black text-[#008F5B] mr-0.5" />
                      </strong>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-[#6E7974] flex items-center gap-1">
                        <span>Gross:</span>
                        <strong className="text-[#17211D]">
                          <BDT amount={r.gross} symbolClassName="text-[1.12em] font-black text-[#17211D] mr-0.5" />
                        </strong>
                      </span>
                      <span className="text-[10px] text-[#D83B3B] flex items-center gap-1">
                        <span>Deduct: -</span>
                        <BDT amount={r.deduction} symbolClassName="text-[1.12em] font-black text-[#D83B3B] mr-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4 bg-white rounded-2xl border border-[#E4ECE8] shadow-sm">
              <Calendar size={36} className="text-[#8A9791] mb-2.5" />
              <h3 className="text-sm font-bold text-[#17211D]">
                {salaryRecords.length === 0 ? 'No Salary Records Yet' : 'No Matching Months Found'}
              </h3>
              <p className="text-xs text-[#6E7974] mt-1 max-w-xs">
                {salaryRecords.length === 0
                  ? 'Your salary record database is empty. Add your monthly salary entry to track your earnings history.'
                  : `No salary entries matched "${searchTerm}". Try another search term.`}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="mt-4 px-4 py-2 bg-[#008F5B] text-white text-xs font-bold rounded-xl hover:bg-[#007A4D] transition-colors shadow-sm cursor-pointer"
              >
                + Add Salary Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
