import React from 'react';
import { Trash2, AlertTriangle, X, Calendar, DollarSign } from 'lucide-react';
import { MonthSalaryRecord } from '../types';
import { formatBDT } from '../mockData';
import { BDT } from './BDT';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  record: MonthSalaryRecord | null;
  onClose: () => void;
  onConfirmDelete: (month: string) => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  record,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div
      id="delete-confirmation-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="delete-confirmation-dialog"
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#FCD4D4] p-5 sm:p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Danger Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0F0] border border-[#FCD4D4] flex items-center justify-center text-[#D83B3B] shrink-0 shadow-xs">
              <Trash2 size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[17px] font-black text-[#17211D] tracking-tight leading-tight">
                Delete Salary Entry?
              </h3>
              <p className="text-[11.5px] text-[#7A8A83] font-medium mt-0.5">
                This action is permanent and irreversible
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-delete-modal-btn"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-[#F4F6F5] hover:bg-[#E8EFEA] flex items-center justify-center text-[#5C6E66] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Record Details Card Preview */}
        <div className="p-3.5 rounded-xl bg-[#FAF5F5] border border-[#FCE2E2] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-[#17211D]">
              <Calendar size={14} className="text-[#D83B3B]" />
              <span>{record.monthLabel}</span>
            </div>
            <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0F0] text-[#D83B3B] border border-[#FCD4D4]">
              Month: {record.month}
            </span>
          </div>

          <div className="pt-2 border-t border-[#F8DADA] flex items-center justify-between text-xs">
            <span className="text-[#7A8A83] font-medium text-[11px]">Net Take-home:</span>
            <strong className="text-[14px] font-black text-[#D83B3B]">
              <BDT amount={record.net} decimals={2} symbolClassName="text-[1.1em] font-black mr-0.5" />
            </strong>
          </div>
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-2 text-[11.5px] text-[#8C4A4A] bg-[#FFF8F8] p-2.5 rounded-xl border border-[#FDE8E8]">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#D83B3B]" />
          <p className="leading-snug">
            Deleting this record will recalculate your annual earnings, monthly average, and comparison statistics.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            id="cancel-delete-record-btn"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-xl border border-[#DCE4E0] bg-white hover:bg-[#F4F6F5] text-[#4A5550] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-delete-record-btn"
            onClick={() => onConfirmDelete(record.month)}
            disabled={isDeleting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#D83B3B] hover:bg-[#B52525] active:scale-[0.98] text-white text-xs font-black transition-all shadow-[0_4px_14px_rgba(216,59,59,0.25)] hover:shadow-[0_6px_18px_rgba(216,59,59,0.35)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
