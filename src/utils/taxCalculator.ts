import { MonthSalaryRecord } from '../types';

/**
 * Bangladesh NBR (National Board of Revenue) Individual Income Tax Slabs & Rules (Assessment Year 2024-2026)
 *
 * General individual slab:
 * - First ৳3,50,000 : 0% (Tax-Free Threshold) [৳4,00,000 for female/seniors 65+]
 * - Next ৳1,00,000  : 5%
 * - Next ৳4,00,000  : 10%
 * - Next ৳5,00,000  : 15%
 * - Next ৳5,00,000  : 20%
 * - Remaining / Balance : 25%
 *
 * Minimum Tax in City Corporation: ৳5,000 (if taxable income > threshold)
 */

export interface TaxSlabBreakdown {
  slabName: string;
  rate: number; // percentage e.g. 0, 5, 10...
  taxableInSlab: number;
  taxAmount: number;
}

export interface TaxCalculationResult {
  totalAnnualGross: number;
  totalAnnualExemptions: number;
  netTaxableIncome: number;
  taxFreeThreshold: number;
  totalYearlyTax: number;
  actualTaxDeductedYearly: number;
  estimatedMonthlyTax: number;
  taxRefundOrDue: number; // >0 means due/payable, <0 means refund/excess paid
  effectiveTaxRate: number; // percentage
  slabBreakdowns: TaxSlabBreakdown[];
}

export function calculateBangladeshIncomeTax(
  salaryRecords: MonthSalaryRecord[],
  selectedYear: number,
  isFemaleOrSenior: boolean = false
): TaxCalculationResult {
  // Filter records for the given year
  const yearRecords = salaryRecords.filter((r) => r.month.startsWith(`${selectedYear}-`));
  const recordCount = yearRecords.length;

  let totalActualGross = 0;
  let totalActualTaxDeducted = 0;
  let totalBasic = 0;
  let totalHouseRent = 0;
  let totalMedical = 0;
  let totalConveyance = 0;

  yearRecords.forEach((r) => {
    totalActualGross += r.gross || 0;
    totalActualTaxDeducted += r.deductions?.['Tax'] || 0;

    // Income items for statutory exemption estimates
    const basic = r.incomes?.['Basic Pay'] || 0;
    totalBasic += basic;
    totalHouseRent += r.incomes?.['House Rent'] || 0;
    totalMedical += r.incomes?.['Medical'] || 0;
    totalConveyance += r.incomes?.['Conveyance'] || 0;
  });

  // Annualize if fewer than 12 recorded months
  const multiplier = recordCount > 0 ? 12 / recordCount : 12;
  const estimatedAnnualGross = recordCount > 0 ? totalActualGross * multiplier : 0;
  const estimatedAnnualTaxDeducted = recordCount > 0 ? totalActualTaxDeducted * multiplier : 0;

  // Exemptions under Bangladesh Tax Law:
  // - House Rent: 50% of Basic or ৳3,00,000 (whichever is less)
  // - Medical: 10% of Basic or ৳1,20,000 (whichever is less)
  // - Conveyance: Up to ৳30,000
  const annualBasic = totalBasic * multiplier;
  const annualHouseRent = totalHouseRent * multiplier;
  const annualMedical = totalMedical * multiplier;
  const annualConveyance = totalConveyance * multiplier;

  const houseRentExemption = Math.min(annualHouseRent, Math.min(annualBasic * 0.5, 300000));
  const medicalExemption = Math.min(annualMedical, Math.min(annualBasic * 0.1, 120000));
  const conveyanceExemption = Math.min(annualConveyance, 30000);

  const totalAnnualExemptions = houseRentExemption + medicalExemption + conveyanceExemption;
  const netTaxableIncome = Math.max(0, estimatedAnnualGross - totalAnnualExemptions);

  const taxFreeThreshold = isFemaleOrSenior ? 400000 : 350000;

  let remaining = netTaxableIncome;
  let totalYearlyTax = 0;
  const slabBreakdowns: TaxSlabBreakdown[] = [];

  // Slab 1: 0% Tax Free Threshold
  const slab1Taxable = Math.min(remaining, taxFreeThreshold);
  slabBreakdowns.push({
    slabName: `First ৳${taxFreeThreshold.toLocaleString('en-BD')} (Tax-Free)`,
    rate: 0,
    taxableInSlab: slab1Taxable,
    taxAmount: 0,
  });
  remaining = Math.max(0, remaining - slab1Taxable);

  // Slab 2: Next ৳1,00,000 @ 5%
  if (remaining > 0) {
    const slab2Taxable = Math.min(remaining, 100000);
    const tax = slab2Taxable * 0.05;
    totalYearlyTax += tax;
    slabBreakdowns.push({
      slabName: 'Next ৳1,00,000 (5%)',
      rate: 5,
      taxableInSlab: slab2Taxable,
      taxAmount: tax,
    });
    remaining = Math.max(0, remaining - slab2Taxable);
  }

  // Slab 3: Next ৳4,00,000 @ 10%
  if (remaining > 0) {
    const slab3Taxable = Math.min(remaining, 400000);
    const tax = slab3Taxable * 0.10;
    totalYearlyTax += tax;
    slabBreakdowns.push({
      slabName: 'Next ৳4,00,000 (10%)',
      rate: 10,
      taxableInSlab: slab3Taxable,
      taxAmount: tax,
    });
    remaining = Math.max(0, remaining - slab3Taxable);
  }

  // Slab 4: Next ৳5,00,000 @ 15%
  if (remaining > 0) {
    const slab4Taxable = Math.min(remaining, 500000);
    const tax = slab4Taxable * 0.15;
    totalYearlyTax += tax;
    slabBreakdowns.push({
      slabName: 'Next ৳5,00,000 (15%)',
      rate: 15,
      taxableInSlab: slab4Taxable,
      taxAmount: tax,
    });
    remaining = Math.max(0, remaining - slab4Taxable);
  }

  // Slab 5: Next ৳5,00,000 @ 20%
  if (remaining > 0) {
    const slab5Taxable = Math.min(remaining, 500000);
    const tax = slab5Taxable * 0.20;
    totalYearlyTax += tax;
    slabBreakdowns.push({
      slabName: 'Next ৳5,00,000 (20%)',
      rate: 20,
      taxableInSlab: slab5Taxable,
      taxAmount: tax,
    });
    remaining = Math.max(0, remaining - slab5Taxable);
  }

  // Slab 6: Balance Above @ 25%
  if (remaining > 0) {
    const tax = remaining * 0.25;
    totalYearlyTax += tax;
    slabBreakdowns.push({
      slabName: 'Remaining Balance (25%)',
      rate: 25,
      taxableInSlab: remaining,
      taxAmount: tax,
    });
    remaining = 0;
  }

  // Minimum tax rule (if taxable income > tax-free threshold, min tax ৳5,000)
  if (netTaxableIncome > taxFreeThreshold && totalYearlyTax < 5000 && totalYearlyTax > 0) {
    totalYearlyTax = 5000;
  }

  const estimatedMonthlyTax = totalYearlyTax / 12;
  const taxRefundOrDue = totalYearlyTax - estimatedAnnualTaxDeducted;
  const effectiveTaxRate = estimatedAnnualGross > 0 ? (totalYearlyTax / estimatedAnnualGross) * 100 : 0;

  return {
    totalAnnualGross: Math.round(estimatedAnnualGross),
    totalAnnualExemptions: Math.round(totalAnnualExemptions),
    netTaxableIncome: Math.round(netTaxableIncome),
    taxFreeThreshold,
    totalYearlyTax: Math.round(totalYearlyTax),
    actualTaxDeductedYearly: Math.round(estimatedAnnualTaxDeducted),
    estimatedMonthlyTax: Math.round(estimatedMonthlyTax),
    taxRefundOrDue: Math.round(taxRefundOrDue),
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    slabBreakdowns,
  };
}
