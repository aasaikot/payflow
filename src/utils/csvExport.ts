import { MonthSalaryRecord, UserProfileData } from '../types';

/**
 * Generates and triggers downloading of CSV / Excel-compatible salary ledger
 */
export function exportSalaryToCSV(
  records: MonthSalaryRecord[],
  userProfile?: UserProfileData
): void {
  if (!records || records.length === 0) {
    alert('No salary records to export.');
    return;
  }

  // 1. Gather all unique income and deduction keys
  const incomeKeys = Array.from(
    new Set(records.flatMap((r) => Object.keys(r.incomes || {})))
  );
  const deductionKeys = Array.from(
    new Set(records.flatMap((r) => Object.keys(r.deductions || {})))
  );

  // 2. Build CSV header rows
  const headers = [
    'Month',
    'Month Label',
    'Gross Earnings (BDT)',
    'Total Deductions (BDT)',
    'Net Pay (BDT)',
    ...incomeKeys.map((k) => `Income: ${k}`),
    ...deductionKeys.map((k) => `Deduction: ${k}`),
    'Record Timestamp',
  ];

  // 3. Build CSV Data Rows
  const sortedRecords = [...records].sort((a, b) => b.month.localeCompare(a.month));

  const rows = sortedRecords.map((r) => {
    const rowData = [
      `"${r.month}"`,
      `"${r.monthLabel}"`,
      r.gross || 0,
      r.deduction || 0,
      r.net || 0,
      ...incomeKeys.map((k) => (r.incomes && r.incomes[k] !== undefined ? r.incomes[k] : 0)),
      ...deductionKeys.map((k) => (r.deductions && r.deductions[k] !== undefined ? r.deductions[k] : 0)),
      `"${r.createdDate || ''}"`,
    ];
    return rowData.join(',');
  });

  // 4. Meta Information Header
  const metaRows = [
    `"PayFlow Secure Salary Register - Export"`,
    `"Employee Name:","${userProfile?.name || 'Employee'}"`,
    `"Designation:","${userProfile?.designation || ''}"`,
    `"Company:","${userProfile?.companyName || ''}"`,
    `"Exported Date:","${new Date().toLocaleString('en-BD')}"`,
    `"Total Months:","${records.length}"`,
    '', // blank separator
  ];

  const csvContent = '\uFEFF' + [...metaRows, headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const employeeTag = userProfile?.name ? `_${userProfile.name.replace(/\s+/g, '_')}` : '';
  link.setAttribute('download', `PayFlow_Salary_Register${employeeTag}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
