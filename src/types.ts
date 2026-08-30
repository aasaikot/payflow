export interface SalaryItem {
  key: string;
  name: string;
  amount: number;
}

export interface MonthSalaryRecord {
  month: string; // '2026-08'
  monthLabel: string; // 'August 2026'
  createdDate: string; // '28 Aug 2026, 10:30 AM'
  gross: number;
  deduction: number;
  net: number;
  incomes: Record<string, number>;
  deductions: Record<string, number>;
  extraIncome?: string[];
  extraDeduction?: string[];
}

export interface UserProfileData {
  uid: string;
  name: string;
  companyName: string;
  designation: string;
  pin: string;
  email: string;
  mobile: string;
  joinDate: string;
  photoURL?: string;
}

export type ScreenType =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'history'
  | 'details'
  | 'comparison'
  | 'add'
  | 'reports'
  | 'profile';
