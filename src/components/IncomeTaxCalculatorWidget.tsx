import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Info,
  HelpCircle,
  TrendingDown,
  Percent,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MonthSalaryRecord } from '../types';
import { calculateBangladeshIncomeTax } from '../utils/taxCalculator';
import { formatBDT } from '../mockData';
import { BDT } from './BDT';

interface IncomeTaxCalculatorWidgetProps {
  salaryRecords: MonthSalaryRecord[];
  selectedYear: number;
}

export const IncomeTaxCalculatorWidget: React.FC<IncomeTaxCalculatorWidgetProps> = ({
  salaryRecords,
  selectedYear,
}) => {
  const [isFemaleOrSenior, setIsFemaleOrSenior] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [customGrossInput, setCustomGrossInput] = useState<string>('');

  const taxResult = calculateBangladeshIncomeTax(salaryRecords, selectedYear, isFemaleOrSenior);

  return (
    <div
      id="income-tax-calculator-widget"
      className="w-full bg-white rounded-2xl border border-[#E3EAE6] p-4 shadow-sm flex flex-col gap-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8F7F0] border border-[#C5EBDB] flex items-center justify-center text-[#008F5B]">
            <Calculator size={19} />
          </div>
          <div>
            <h3 className="text-[15px] font-black text-[#17211D] tracking-tight flex items-center gap-1.5">
              NBR Income Tax Projection
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#008F5B]/10 text-[#008F5B]">
                {selectedYear}
              </span>
            </h3>
            <p className="text-[11px] text-[#6E7974] font-medium">
              BD NBR Individual Tax Assessment (FY {selectedYear}-{selectedYear + 1})
            </p>
          </div>
        </div>
      </div>

      {/* Tax Category Toggle (General vs Female/Senior) */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8]">
        <span className="text-xs font-semibold text-[#17211D]">Taxpayer Category:</span>
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#D7E0DC] text-xs">
          <button
            type="button"
            onClick={() => setIsFemaleOrSenior(false)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              !isFemaleOrSenior
                ? 'bg-[#008F5B] text-white shadow-2xs'
                : 'text-[#6E7974] hover:text-[#17211D]'
            }`}
          >
            General (৳3.5L)
          </button>
          <button
            type="button"
            onClick={() => setIsFemaleOrSenior(true)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
              isFemaleOrSenior
                ? 'bg-[#008F5B] text-white shadow-2xs'
                : 'text-[#6E7974] hover:text-[#17211D]'
            }`}
          >
            Female / Senior 65+ (৳4.0L)
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] flex flex-col">
          <span className="text-[11px] font-semibold text-[#6E7974]">Est. Annual Income</span>
          <span className="text-[16px] font-black text-[#17211D] mt-0.5">
            <BDT amount={taxResult.totalAnnualGross} />
          </span>
          <span className="text-[10px] text-[#6E7974] mt-0.5">
            Exemptions: <BDT amount={taxResult.totalAnnualExemptions} />
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#E8F7F0] border border-[#C5EBDB] flex flex-col">
          <span className="text-[11px] font-semibold text-[#008F5B]">Total Yearly Tax</span>
          <span className="text-[16px] font-black text-[#008F5B] mt-0.5">
            <BDT amount={taxResult.totalYearlyTax} />
          </span>
          <span className="text-[10px] text-[#008F5B] font-bold mt-0.5">
            Est. Monthly: <BDT amount={taxResult.estimatedMonthlyTax} />
          </span>
        </div>
      </div>

      {/* Actual Tax Deducted vs Projection */}
      <div className="p-3 rounded-xl bg-white border border-[#E4ECE8] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#17211D]">TDS Deducted This Year</span>
          <span className="text-[10px] text-[#6E7974]">Based on monthly salary slips</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-[#17211D]">
            <BDT amount={taxResult.actualTaxDeductedYearly} />
          </span>
          {taxResult.taxRefundOrDue > 0 ? (
            <span className="text-[10.5px] text-[#D83B3B] font-bold flex items-center gap-0.5">
              Due: <BDT amount={taxResult.taxRefundOrDue} />
            </span>
          ) : taxResult.taxRefundOrDue < 0 ? (
            <span className="text-[10.5px] text-[#008F5B] font-bold flex items-center gap-0.5">
              Excess Paid: <BDT amount={Math.abs(taxResult.taxRefundOrDue)} />
            </span>
          ) : (
            <span className="text-[10.5px] text-[#008F5B] font-bold flex items-center gap-0.5">
              <CheckCircle2 size={11} /> Fully Covered
            </span>
          )}
        </div>
      </div>

      {/* Tax Slabs Accordion */}
      <div className="border-t border-[#E4ECE8] pt-2.5">
        <button
          type="button"
          onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#008F5B] hover:text-[#007A4D] transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Layers size={14} />
            View NBR Tax Slab Breakdown
          </span>
          {isBreakdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {isBreakdownOpen && (
          <div className="mt-2.5 flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] text-[11px]">
            <div className="grid grid-cols-3 pb-1 border-b border-[#E4ECE8] font-bold text-[#6E7974] text-[10px] uppercase">
              <span>Slab</span>
              <span className="text-right">Taxable</span>
              <span className="text-right">Tax</span>
            </div>
            {taxResult.slabBreakdowns.map((slab, idx) => (
              <div key={idx} className="grid grid-cols-3 py-0.5 text-[#17211D] font-medium">
                <span className="truncate">{slab.slabName}</span>
                <span className="text-right font-mono text-[#6E7974]">
                  <BDT amount={slab.taxableInSlab} />
                </span>
                <span className="text-right font-mono font-bold text-[#17211D]">
                  <BDT amount={slab.taxAmount} />
                </span>
              </div>
            ))}
            <div className="pt-1.5 mt-1 border-t border-[#E4ECE8] flex items-center justify-between font-extrabold text-[#17211D]">
              <span>Effective Rate</span>
              <span className="text-[#008F5B]">{taxResult.effectiveTaxRate}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
