import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { MonthSalaryRecord, ScreenType } from '../types';
import { formatBDT } from '../mockData';

interface AddSalaryViewProps {
  initialMonth?: string;
  existingRecords: MonthSalaryRecord[];
  onSaveRecord: (record: MonthSalaryRecord) => void;
  onNavigate: (screen: ScreenType) => void;
}

const MONTHS_LIST = [
  { num: '01', short: 'Jan', full: 'January' },
  { num: '02', short: 'Feb', full: 'February' },
  { num: '03', short: 'Mar', full: 'March' },
  { num: '04', short: 'Apr', full: 'April' },
  { num: '05', short: 'May', full: 'May' },
  { num: '06', short: 'Jun', full: 'June' },
  { num: '07', short: 'Jul', full: 'July' },
  { num: '08', short: 'Aug', full: 'August' },
  { num: '09', short: 'Sep', full: 'September' },
  { num: '10', short: 'Oct', full: 'October' },
  { num: '11', short: 'Nov', full: 'November' },
  { num: '12', short: 'Dec', full: 'December' },
];

const DEFAULT_INCOME_FIELDS = [
  'Basic Pay',
  'House Rent',
  'Medical',
  'Conveyance',
  'Special',
  'Dearness',
  'Overtime',
  'Utility',
];

const DEFAULT_DEDUCTION_FIELDS = [
  'PF',
  'PF Loan',
  'Interest PF',
  'Canteen',
  'Picnic',
  'Advanced',
  'Welfare',
  'Stamps',
  'Tax',
];

// Helper to find the next available unrecorded month
export const getNextNewMonth = (existingRecords: MonthSalaryRecord[]): string => {
  if (!existingRecords || existingRecords.length === 0) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // Sort existing months descending to find the latest
  const sortedMonths = [...existingRecords]
    .map((r) => r.month)
    .sort((a, b) => b.localeCompare(a));

  const latestMonthStr = sortedMonths[0]; // e.g. "2026-08"
  const [yearStr, monthStr] = latestMonthStr.split('-');
  let year = parseInt(yearStr, 10) || 2026;
  let month = parseInt(monthStr, 10) || 8;

  // Advance by 1 month
  month += 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }

  let candidate = `${year}-${String(month).padStart(2, '0')}`;
  let safety = 0;
  while (existingRecords.some((r) => r.month === candidate) && safety < 48) {
    const [cy, cm] = candidate.split('-');
    let y = parseInt(cy, 10);
    let m = parseInt(cm, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    candidate = `${y}-${String(m).padStart(2, '0')}`;
    safety++;
  }

  return candidate;
};

export const AddSalaryView: React.FC<AddSalaryViewProps> = ({
  initialMonth,
  existingRecords,
  onSaveRecord,
  onNavigate,
}) => {
  // If initialMonth is explicitly passed (e.g. from Edit flow), use it;
  // Otherwise, automatically select the next unrecorded new month!
  const defaultMonth = initialMonth || getNextNewMonth(existingRecords);

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(() => {
    return defaultMonth.split('-')[0] || '2026';
  });

  // Check if current selected month already has an existing record
  const existing = existingRecords.find((r) => r.month === selectedMonth);

  const [incomes, setIncomes] = useState<Record<string, number>>(() => {
    if (initialMonth && existing) return { ...existing.incomes };
    const initial: Record<string, number> = {};
    DEFAULT_INCOME_FIELDS.forEach((f) => {
      initial[f] = 0;
    });
    return initial;
  });

  const [deductions, setDeductions] = useState<Record<string, number>>(() => {
    if (initialMonth && existing) return { ...existing.deductions };
    const initial: Record<string, number> = {};
    DEFAULT_DEDUCTION_FIELDS.forEach((f) => {
      initial[f] = 0;
    });
    return initial;
  });

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'income' | 'deduction' | null>(null);

  // Default percentage states for smart auto-calculation
  const [houseRentPct, setHouseRentPct] = useState<number>(80);
  const [specialPct, setSpecialPct] = useState<number>(10);
  const [pfPct, setPfPct] = useState<number>(10);

  // String buffers for inputs to allow typing '50%', '40%', or raw numbers freely
  const [inputBuffers, setInputBuffers] = useState<Record<string, string>>({});

  // Handle month switch
  const handleSelectMonth = (monthStr: string) => {
    setSelectedMonth(monthStr);
    const rec = existingRecords.find((r) => r.month === monthStr);
    if (rec) {
      setIncomes({ ...rec.incomes });
      setDeductions({ ...rec.deductions });
      setInputBuffers({});
      if (rec.incomes['Basic Pay'] && rec.incomes['Basic Pay'] > 0) {
        if (rec.incomes['House Rent']) {
          setHouseRentPct(Math.round((rec.incomes['House Rent'] / rec.incomes['Basic Pay']) * 100));
        }
        if (rec.incomes['Special']) {
          setSpecialPct(Math.round((rec.incomes['Special'] / rec.incomes['Basic Pay']) * 100));
        }
        if (rec.deductions['PF']) {
          setPfPct(Math.round((rec.deductions['PF'] / rec.incomes['Basic Pay']) * 100));
        }
      }
    } else {
      // In New Entry Mode, start with 0 / blank fields
      const blankIncomes: Record<string, number> = {};
      DEFAULT_INCOME_FIELDS.forEach((f) => {
        blankIncomes[f] = 0;
      });
      const blankDeductions: Record<string, number> = {};
      DEFAULT_DEDUCTION_FIELDS.forEach((f) => {
        blankDeductions[f] = 0;
      });
      setIncomes(blankIncomes);
      setDeductions(blankDeductions);
      setInputBuffers({});
      setHouseRentPct(80);
      setSpecialPct(10);
      setPfPct(10);
    }
  };

  const handleYearChange = (delta: number) => {
    const nextYear = String(parseInt(selectedYear, 10) + delta);
    setSelectedYear(nextYear);
    const currentMonthNum = selectedMonth.split('-')[1] || '01';
    handleSelectMonth(`${nextYear}-${currentMonthNum}`);
  };

  // Helper to calculate and apply percentage on field
  const applyPercentageToField = (
    field: 'House Rent' | 'Special' | 'PF',
    percentage: number,
    baseBasic?: number
  ) => {
    const currentBasic = baseBasic !== undefined ? baseBasic : (incomes['Basic Pay'] || 0);
    const calculatedAmount = Math.round(currentBasic * (percentage / 100));

    if (field === 'House Rent') {
      setHouseRentPct(percentage);
      setIncomes((prev) => ({ ...prev, 'House Rent': calculatedAmount }));
      setInputBuffers((prev) => ({ ...prev, 'House Rent': String(calculatedAmount || '') }));
    } else if (field === 'Special') {
      setSpecialPct(percentage);
      setIncomes((prev) => ({ ...prev, 'Special': calculatedAmount }));
      setInputBuffers((prev) => ({ ...prev, 'Special': String(calculatedAmount || '') }));
    } else if (field === 'PF') {
      setPfPct(percentage);
      setDeductions((prev) => ({ ...prev, 'PF': calculatedAmount }));
      setInputBuffers((prev) => ({ ...prev, 'PF': String(calculatedAmount || '') }));
    }
  };

  // Automatic calculation rule: Basic Pay triggers House Rent (80%), Special (10%), PF (10%)
  const handleIncomeChange = (field: string, rawVal: string) => {
    // Keep raw string buffer for smooth typing (including %)
    setInputBuffers((prev) => ({ ...prev, [field]: rawVal }));

    const basicVal = field === 'Basic Pay' ? (parseFloat(rawVal) || 0) : (incomes['Basic Pay'] || 0);

    // If typing percentage in House Rent or Special (e.g., "50%" or "40%")
    if (rawVal.includes('%')) {
      const parsedPct = parseFloat(rawVal.replace('%', ''));
      if (!isNaN(parsedPct)) {
        if (field === 'House Rent') {
          applyPercentageToField('House Rent', parsedPct, basicVal);
          return;
        } else if (field === 'Special') {
          applyPercentageToField('Special', parsedPct, basicVal);
          return;
        }
      }
    }

    const numVal = parseFloat(rawVal) || 0;
    const nextIncomes = { ...incomes, [field]: numVal };

    if (field === 'Basic Pay') {
      // Default: House Rent = 80%, Special = 10%, PF = 10%
      const hrAmt = Math.round(numVal * (houseRentPct / 100));
      const spAmt = Math.round(numVal * (specialPct / 100));
      const pfAmt = Math.round(numVal * (pfPct / 100));

      nextIncomes['House Rent'] = hrAmt;
      nextIncomes['Special'] = spAmt;

      setInputBuffers((prev) => ({
        ...prev,
        'Basic Pay': rawVal,
        'House Rent': hrAmt > 0 ? String(hrAmt) : '',
        'Special': spAmt > 0 ? String(spAmt) : '',
        'PF': pfAmt > 0 ? String(pfAmt) : '',
      }));

      setDeductions((prev) => ({
        ...prev,
        'PF': pfAmt,
      }));
    } else if (field === 'House Rent' && basicVal > 0) {
      // Calculate effective percentage from manual entry
      const derivedPct = Number(((numVal / basicVal) * 100).toFixed(1));
      setHouseRentPct(derivedPct);
    } else if (field === 'Special' && basicVal > 0) {
      const derivedPct = Number(((numVal / basicVal) * 100).toFixed(1));
      setSpecialPct(derivedPct);
    }

    setIncomes(nextIncomes);
  };

  const handleDeductionChange = (field: string, rawVal: string) => {
    setInputBuffers((prev) => ({ ...prev, [field]: rawVal }));

    const basicVal = incomes['Basic Pay'] || 0;

    // If typing percentage in PF (e.g., "10%" or "8.33%")
    if (field === 'PF' && rawVal.includes('%')) {
      const parsedPct = parseFloat(rawVal.replace('%', ''));
      if (!isNaN(parsedPct)) {
        applyPercentageToField('PF', parsedPct, basicVal);
        return;
      }
    }

    const numVal = parseFloat(rawVal) || 0;
    if (field === 'PF' && basicVal > 0) {
      const derivedPct = Number(((numVal / basicVal) * 100).toFixed(1));
      setPfPct(derivedPct);
    }

    setDeductions({ ...deductions, [field]: numVal });
  };

  // Helper when input loses focus: clean up display value if percentage was typed
  const handleInputBlur = (field: string, isIncomeField: boolean) => {
    const rawVal = inputBuffers[field];
    if (rawVal && rawVal.includes('%')) {
      const parsedPct = parseFloat(rawVal.replace('%', ''));
      const basicVal = incomes['Basic Pay'] || 0;
      if (!isNaN(parsedPct) && basicVal > 0) {
        const calculatedAmt = Math.round(basicVal * (parsedPct / 100));
        if (isIncomeField) {
          setIncomes((prev) => ({ ...prev, [field]: calculatedAmt }));
        } else {
          setDeductions((prev) => ({ ...prev, [field]: calculatedAmt }));
        }
        setInputBuffers((prev) => ({ ...prev, [field]: String(calculatedAmt) }));
      }
    }
  };

  const handleAddExtraField = () => {
    if (!newFieldName.trim() || !newFieldType) return;
    const name = newFieldName.trim();

    if (newFieldType === 'income') {
      setIncomes((prev) => ({ ...prev, [name]: 0 }));
    } else {
      setDeductions((prev) => ({ ...prev, [name]: 0 }));
    }

    setNewFieldName('');
    setNewFieldType(null);
  };

  // Totals
  const totalGross: number = (Object.values(incomes) as number[]).reduce(
    (a: number, b: number) => a + Number(b || 0),
    0
  );
  const totalDeduction: number = (Object.values(deductions) as number[]).reduce(
    (a: number, b: number) => a + Number(b || 0),
    0
  );
  const netSalary: number = totalGross - totalDeduction;

  const handleSave = () => {
    const [y, m] = selectedMonth.split('-');
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const newRecord: MonthSalaryRecord = {
      month: selectedMonth,
      monthLabel,
      createdDate: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      gross: totalGross,
      deduction: totalDeduction,
      net: netSalary,
      incomes,
      deductions,
    };

    onSaveRecord(newRecord);
    onNavigate('dashboard');
  };

  const selectedMonthObj = MONTHS_LIST.find(
    (m) => `${selectedYear}-${m.num}` === selectedMonth
  );

  return (
    <div id="add-salary-screen" className="w-full flex flex-col pb-28">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#E4ECE8] sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="add-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-black text-[#17211D] tracking-tight">
              {existing ? 'Update Salary Slip' : 'Add Salary Slip'}
            </h1>
            <span className="text-[10px] text-[#6E7974] font-medium -mt-0.5">
              {existing ? 'Modify existing month records' : 'Enter figures for new month'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">
        {/* 12-MONTH CALENDAR SELECTOR CARD */}
        <div
          id="calendar-month-picker-card"
          className="w-full bg-white rounded-xl p-4 border border-[#E4ECE8] shadow-[0_4px_20px_rgba(23,33,29,0.03)]"
        >
          {/* Year Switcher Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                <CalendarIcon size={15} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-[#17211D]">
                  Payroll Calendar
                </span>
                <span className="text-[9px] text-[#6E7974] font-medium">
                  Select month to add or update
                </span>
              </div>
            </div>

            {/* Year Controls */}
            <div className="flex items-center gap-1.5 bg-[#F5FAF7] border border-[#E4ECE8] rounded-xl px-1.5 py-1">
              <button
                type="button"
                onClick={() => handleYearChange(-1)}
                className="w-6 h-6 rounded-lg hover:bg-[#E9F7F1] text-[#17211D] flex items-center justify-center transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="text-[13px] font-black text-[#17211D] px-1 font-mono">
                {selectedYear}
              </span>
              <button
                type="button"
                onClick={() => handleYearChange(1)}
                className="w-6 h-6 rounded-lg hover:bg-[#E9F7F1] text-[#17211D] flex items-center justify-center transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* 12-Month Calendar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {MONTHS_LIST.map((m) => {
              const monthKey = `${selectedYear}-${m.num}`;
              const isSelected = selectedMonth === monthKey;
              const hasExistingRecord = existingRecords.some((r) => r.month === monthKey);

              return (
                <button
                  key={m.num}
                  type="button"
                  id={`calendar-month-${m.num}`}
                  onClick={() => handleSelectMonth(monthKey)}
                  className={`py-2 px-1.5 rounded-lg flex flex-col items-center justify-center relative transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#008F5B] to-[#007A4D] text-white shadow-md shadow-[#008F5B]/30 scale-[1.03] ring-2 ring-[#008F5B]/30'
                      : hasExistingRecord
                      ? 'bg-[#E9F7F1] border border-[#008F5B]/30 text-[#008F5B] hover:bg-[#DCF5E9]'
                      : 'bg-[#F8FAF9] border border-[#E4ECE8] text-[#17211D] hover:bg-[#E9F7F1]/50 hover:border-[#008F5B]/20'
                  }`}
                >
                  {/* Status Indicator Dot */}
                  {hasExistingRecord && !isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#008F5B]" />
                  )}

                  {/* Month Short Code */}
                  <span
                    className={`text-[12px] font-black tracking-tight ${
                      isSelected ? 'text-white' : hasExistingRecord ? 'text-[#008F5B]' : 'text-[#17211D]'
                    }`}
                  >
                    {m.short}
                  </span>

                  {/* Month Sub-Label */}
                  <span
                    className={`text-[8.5px] mt-0.5 font-medium ${
                      isSelected
                        ? 'text-emerald-100 font-bold'
                        : hasExistingRecord
                        ? 'text-[#008F5B]/80 font-bold'
                        : 'text-[#84928C]'
                    }`}
                  >
                    {hasExistingRecord ? (isSelected ? 'Active' : 'Saved') : `M${parseInt(m.num, 10)}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Month Status Banner */}
          <div className="mt-3 pt-2.5 border-t border-[#F0F4F2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#6E7974]">
                {existing ? 'Editing:' : 'Selected Month:'}
              </span>
              <strong className="text-[12px] font-extrabold text-[#008F5B]">
                {selectedMonthObj?.full} {selectedYear}
              </strong>
            </div>

            {existing && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008F5B] bg-[#E9F7F1] px-2.5 py-0.5 rounded-full border border-[#008F5B]/20">
                <CheckCircle2 size={11} />
                Existing Record Loaded
              </span>
            )}
          </div>
        </div>

        {/* 1. INCOME SECTION */}
        <div
          id="income-inputs-card"
          className="w-full bg-white rounded-xl p-4 border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] mb-3">
            <span className="text-[12px] font-extrabold text-[#008F5B] uppercase tracking-wider">
              INCOME
            </span>
            <span className="text-[12px] font-extrabold text-[#008F5B]">
              {formatBDT(totalGross)}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.entries(incomes).map(([field, rawVal]) => {
              const val = Number(rawVal || 0);
              const displayVal =
                inputBuffers[field] !== undefined
                  ? inputBuffers[field]
                  : val === 0
                  ? ''
                  : String(val);

              const isHouseRent = field === 'House Rent';
              const isSpecial = field === 'Special';
              const hasVal = val > 0 || (incomes['Basic Pay'] || 0) > 0;

              return (
                <div
                  key={field}
                  className={`flex flex-col gap-1.5 p-2 rounded-xl transition-all ${
                    (isHouseRent || isSpecial) && hasVal
                      ? 'bg-[#F9FCFA] border border-[#008F5B]/15 shadow-2xs'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#17211D]">
                        {field}
                      </span>
                    </div>

                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6E7974]">
                        ৳
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        value={displayVal}
                        onChange={(e) => handleIncomeChange(field, e.target.value)}
                        onBlur={() => handleInputBlur(field, true)}
                        placeholder="0.00"
                        className="w-full h-9 pl-6 pr-2.5 rounded-xl border border-[#D7E0DC] text-right text-xs font-bold text-[#17211D] focus:border-[#008F5B] focus:ring-1 focus:ring-[#008F5B] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Bengali Info for House Rent */}
                  {isHouseRent && hasVal && (
                    <div className="mt-0.5 pt-1.5 border-t border-[#008F5B]/10 flex items-center gap-1 text-[10.5px] text-[#008F5B] font-medium leading-tight">
                      <Sparkles size={11} className="shrink-0 text-[#008F5B]" />
                      <span>
                        আপনার হাউজ রেন্টের পার্সেন্টেজ লিখুন, বা সরাসরি টাকার পরিমাণ লিখুন। উদাহরণঃ <strong>50%</strong>
                      </span>
                    </div>
                  )}

                  {/* Bengali Info for Special */}
                  {isSpecial && hasVal && (
                    <div className="mt-0.5 pt-1.5 border-t border-[#008F5B]/10 flex items-center gap-1 text-[10.5px] text-[#008F5B] font-medium leading-tight">
                      <Sparkles size={11} className="shrink-0 text-[#008F5B]" />
                      <span>
                        আপনার স্পেশালের পার্সেন্টেজ লিখুন, বা সরাসরি টাকার পরিমাণ লিখুন। উদাহরণঃ <strong>10%</strong> 
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Extra Income Button */}
          <div className="mt-3.5 pt-3 border-t border-[#F0F4F2] dark:border-[#20342A]">
            <button
              type="button"
              id="add-extra-income-btn"
              onClick={() => setNewFieldType('income')}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#F0FDF4] to-[#E9F7F1] dark:from-[#11241B] dark:to-[#163024] hover:from-[#E9F7F1] hover:to-[#D9F4E7] dark:hover:from-[#163024] dark:hover:to-[#1B3D2E] border border-[#008F5B]/30 dark:border-[#008F5B]/50 rounded-xl text-xs font-black text-[#008F5B] dark:text-[#10E594] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-[#008F5B] text-white flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus size={13} strokeWidth={3} />
              </div>
              <span>Add Custom Income Field</span>
            </button>
          </div>
        </div>

        {/* 2. DEDUCTION SECTION */}
        <div
          id="deduction-inputs-card"
          className="w-full bg-white dark:bg-[#14221C] rounded-xl p-4 border border-[#E4ECE8] dark:border-[#21352C] shadow-[0_4px_16px_rgba(23,33,29,0.02)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2] dark:border-[#20342A] mb-3">
            <span className="text-[12px] font-extrabold text-[#D83B3B] dark:text-[#FB7185] uppercase tracking-wider">
              DEDUCTION
            </span>
            <span className="text-[12px] font-extrabold text-[#D83B3B] dark:text-[#FB7185]">
              {formatBDT(totalDeduction)}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {Object.entries(deductions).map(([field, rawVal]) => {
              const val = Number(rawVal || 0);
              const displayVal =
                inputBuffers[field] !== undefined
                  ? inputBuffers[field]
                  : val === 0
                  ? ''
                  : String(val);

              const isPF = field === 'PF';
              const hasVal = val > 0 || (incomes['Basic Pay'] || 0) > 0;

              return (
                <div
                  key={field}
                  className={`flex flex-col gap-1.5 p-2 rounded-xl transition-all ${
                    isPF && hasVal ? 'bg-[#FDFBFB] dark:bg-[#221214] border border-[#D83B3B]/15 dark:border-[#D83B3B]/30 shadow-2xs' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#17211D] dark:text-[#F1F7F4]">
                        {field}
                      </span>
                    </div>

                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6E7974] dark:text-[#9DB3A8]">
                        ৳
                      </span>
                      <input
                        type="text"
                        inputMode="text"
                        value={displayVal}
                        onChange={(e) => handleDeductionChange(field, e.target.value)}
                        onBlur={() => handleInputBlur(field, false)}
                        placeholder="0.00"
                        className="w-full h-9 pl-6 pr-2.5 rounded-xl border border-[#D7E0DC] dark:border-[#283D32] dark:bg-[#0E1814] text-right text-xs font-bold text-[#D83B3B] dark:text-[#FB7185] focus:border-[#D83B3B] focus:ring-1 focus:ring-[#D83B3B] outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Bengali Info for PF */}
                  {isPF && hasVal && (
                    <div className="mt-0.5 pt-1.5 border-t border-[#D83B3B]/10 dark:border-[#D83B3B]/20 flex items-center gap-1 text-[10.5px] text-[#D83B3B] dark:text-[#FB7185] font-medium leading-tight">
                      <Sparkles size={11} className="shrink-0 text-[#D83B3B] dark:text-[#FB7185]" />
                      <span>
                        আপনার পিএফের পার্সেন্টেজ লিখুন, বা সরাসরি টাকার পরিমাণ লিখুন। উদাহরণঃ <strong>10%</strong>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Extra Deduction Button */}
          <div className="mt-3.5 pt-3 border-t border-[#F0F4F2] dark:border-[#20342A]">
            <button
              type="button"
              id="add-extra-deduction-btn"
              onClick={() => setNewFieldType('deduction')}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#FEF2F2] to-[#FEE2E2] dark:from-[#241214] dark:to-[#33181C] hover:from-[#FEE2E2] hover:to-[#FED7D7] dark:hover:from-[#33181C] dark:hover:to-[#441E24] border border-[#D83B3B]/30 dark:border-[#D83B3B]/50 rounded-xl text-xs font-black text-[#D83B3B] dark:text-[#FB7185] flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-full bg-[#D83B3B] text-white flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus size={13} strokeWidth={3} />
              </div>
              <span>Add Custom Deduction Field</span>
            </button>
          </div>
        </div>
      </div>

      {/* Redesigned Add Custom Field Modal */}
      {newFieldType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl border border-[#D7E0DC] flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  newFieldType === 'income'
                    ? 'bg-[#E9F7F1] text-[#008F5B]'
                    : 'bg-[#FEF2F2] text-[#D83B3B]'
                }`}
              >
                <Plus size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#17211D]">
                  New {newFieldType === 'income' ? 'Income' : 'Deduction'} Item
                </h3>
                <p className="text-[11px] text-[#6E7974]">
                  Enter field name to track extra payroll adjustments
                </p>
              </div>
            </div>

            <div className="pt-2">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder={
                  newFieldType === 'income'
                    ? 'e.g. Festival Bonus, Arrears, Night Shift'
                    : 'e.g. Health Insurance, Provident Fund Extra, Fine'
                }
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-[#17211D] outline-none transition-all ${
                  newFieldType === 'income'
                    ? 'border-[#D7E0DC] focus:border-[#008F5B] focus:ring-1 focus:ring-[#008F5B]'
                    : 'border-[#D7E0DC] focus:border-[#D83B3B] focus:ring-1 focus:ring-[#D83B3B]'
                }`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddExtraField();
                }}
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setNewFieldType(null);
                  setNewFieldName('');
                }}
                className="flex-1 h-10 rounded-xl border border-[#D7E0DC] text-xs font-bold text-[#6E7974] hover:bg-[#F5FAF7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddExtraField}
                className={`flex-1 h-10 rounded-xl text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                  newFieldType === 'income'
                    ? 'bg-[#008F5B] hover:bg-[#007A4D]'
                    : 'bg-[#D83B3B] hover:bg-[#B91C1C]'
                }`}
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Summary & Save Bar (Safe from frame overflow) */}
      <div className="sticky bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-[#E4ECE8] px-4 py-3 z-30 shadow-[0_-6px_20px_rgba(23,33,29,0.06)] flex flex-col gap-2.5 mt-4">
        <div className="flex items-center justify-between text-[11.5px] font-bold px-1">
          <div className="flex flex-col items-start">
            <span className="text-[#6E7974] text-[9.5px] font-bold uppercase tracking-wider">GROSS</span>
            <span className="text-[#17211D] font-extrabold">{formatBDT(totalGross)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[#D83B3B] text-[9.5px] font-bold uppercase tracking-wider">DEDUCTION</span>
            <span className="text-[#D83B3B] font-extrabold">{formatBDT(totalDeduction)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#008F5B] text-[9.5px] font-bold uppercase tracking-wider">NET</span>
            <span className="text-[#008F5B] font-black">{formatBDT(netSalary)}</span>
          </div>
        </div>

        <button
          id="save-salary-btn"
          type="button"
          onClick={handleSave}
          className="w-full h-11 bg-[#008F5B] hover:bg-[#007A4D] active:scale-[0.99] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Check size={18} strokeWidth={2.5} />
          <span>Save Salary</span>
        </button>
      </div>
    </div>
  );
};
