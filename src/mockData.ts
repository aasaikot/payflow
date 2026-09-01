import { MonthSalaryRecord, UserProfileData } from './types';

// The exact raw Firebase data structure provided by the user
export interface FirebaseMonthData {
  deduction: Record<string, number>;
  extraDeduction?: string[];
  income: Record<string, number>;
  timestamp: number;
}

export interface FirebaseUserData {
  profile: {
    companyName: string;
    designation: string;
    email: string;
    mobile: string;
    name: string;
    pin: string;
    photoURL?: string;
    joinDate?: string;
  };
  months: Record<string, FirebaseMonthData>;
}

export const RAW_FIREBASE_DATA: FirebaseUserData = {
  profile: {
    companyName: "PayFlow Workspace",
    designation: "Assistant Engineering Officer",
    email: "saikot@saikot.bd",
    mobile: "01719364298",
    name: "Asif Arman Saikot",
    pin: "5556"
  },
  months: {
    "2026-01": {
      deduction: {
        Advanced: 0,
        Canteen: 357,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 250,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 3790,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787485392508
    },
    "2026-02": {
      deduction: {
        Advanced: 0,
        Canteen: 289,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 250,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 2710,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787485501867
    },
    "2026-03": {
      deduction: {
        Advanced: 0,
        Canteen: 204,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 250,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 2160,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787928174882
    },
    "2026-04": {
      deduction: {
        Advanced: 0,
        Canteen: 204,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 134,
        Stamps: 10,
        Tax: 272,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 4590,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787772889508
    },
    "2026-05": {
      deduction: {
        Advanced: 0,
        Canteen: 357,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 272,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 5670,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787485874811
    },
    "2026-06": {
      deduction: {
        Advanced: 0,
        Canteen: 204,
        "Interest PF": 0,
        PF: 2246,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 776,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 22460,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 17968,
        Medical: 1900,
        Refreshment: 1080,
        Special: 2246,
        Utility: 950
      },
      timestamp: 1787485999499
    },
    "2026-07": {
      deduction: {
        Advanced: 0,
        Canteen: 340,
        "Interest PF": 0,
        PF: 2359,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 417,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 23590,
        Conveyance: 1150,
        Dearness: 0,
        "House Rent": 18872,
        Medical: 1900,
        Refreshment: 3260,
        Special: 2359,
        Utility: 950
      },
      timestamp: 1787486143573
    },
    "2026-08": {
      deduction: {
        Advanced: 0,
        Canteen: 374,
        "Interest PF": 0,
        PF: 2359,
        "PF Loan": 0,
        Picnic: 0,
        Stamps: 10,
        Tax: 417,
        Welfare: 100,
        "Welfare Subs": 10
      },
      extraDeduction: ["Welfare Subs"],
      income: {
        "Basic Pay": 23590,
        Conveyance: 1610,
        Dearness: 0,
        "House Rent": 18872,
        Medical: 2660,
        Refreshment: 5270,
        Special: 2359,
        Utility: 1330
      },
      timestamp: 1788089802970
    }
  }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || monthStr;
  return `${monthName} ${yearStr}`;
}

export function formatCreatedDate(timestamp?: number, monthKey?: string): string {
  if (timestamp) {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthShort = MONTH_NAMES[d.getMonth()]?.slice(0, 3) || '';
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day} ${monthShort} ${year}, ${hours}:${minutes} ${ampm}`;
    }
  }
  if (monthKey) {
    const label = getMonthLabel(monthKey);
    return `28 ${label.slice(0, 3)} ${monthKey.slice(0, 4)}, 10:00 AM`;
  }
  return '28 Aug 2026, 10:00 AM';
}

export function convertFirebaseMonthsToRecords(
  months: Record<string, FirebaseMonthData>
): MonthSalaryRecord[] {
  const records: MonthSalaryRecord[] = [];
  const sortedMonthKeys = Object.keys(months).sort().reverse();

  for (const monthKey of sortedMonthKeys) {
    const data = months[monthKey];
    if (!data) continue;

    const rawIncomes = data.income || {};
    const deductions = data.deduction || {};

    // Standardize 'Refreshment' -> 'Overtime'
    const incomes: Record<string, number> = {};
    for (const [k, v] of Object.entries(rawIncomes)) {
      if (k === 'Refreshment') {
        incomes['Overtime'] = Number(v) || 0;
      } else {
        incomes[k] = Number(v) || 0;
      }
    }

    const gross = Object.values(incomes).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const deduction = Object.values(deductions).reduce((sum, v) => sum + (Number(v) || 0), 0);
    const net = gross - deduction;

    records.push({
      month: monthKey,
      monthLabel: getMonthLabel(monthKey),
      createdDate: formatCreatedDate(data.timestamp, monthKey),
      gross,
      deduction,
      net,
      incomes,
      deductions,
      extraDeduction: data.extraDeduction || [],
    });
  }

  return records;
}

export function convertFirebaseProfileToUser(
  rawProfile: FirebaseUserData['profile'],
  uid: string = '5556'
): UserProfileData {
  return {
    uid,
    name: rawProfile.name || 'Asif Arman Saikot',
    companyName: rawProfile.companyName || 'PayFlow Workspace',
    designation: rawProfile.designation || 'Assistant Engineering Officer',
    pin: rawProfile.pin || '5556',
    email: rawProfile.email || 'saikot@saikot.bd',
    mobile: rawProfile.mobile || '01719364298',
    joinDate: rawProfile.joinDate || '01 January 2024',
    photoURL:
      rawProfile.photoURL ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };
}

export const INITIAL_USER_PROFILE: UserProfileData = convertFirebaseProfileToUser(
  RAW_FIREBASE_DATA.profile,
  '5556'
);

export const INITIAL_SALARY_RECORDS: MonthSalaryRecord[] = convertFirebaseMonthsToRecords(
  RAW_FIREBASE_DATA.months
);

export const formatBDT = (val: number): string => {
  return '৳' + Number(val || 0).toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
