import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from './firebase';
import { MonthSalaryRecord, UserProfileData } from './types';
import { INITIAL_SALARY_RECORDS, INITIAL_USER_PROFILE } from './mockData';

// User Profile Service
export async function fetchUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    await setDoc(userDocRef, profile, { merge: true });
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
    throw error;
  }
}

// Salary Records Service
export async function fetchSalaryRecords(uid: string): Promise<MonthSalaryRecord[]> {
  try {
    const salariesCollRef = collection(db, 'users', uid, 'salaries');
    const q = query(salariesCollRef, orderBy('month', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // If new account, seed initial data for the user in Firestore
      await seedInitialData(uid);
      return INITIAL_SALARY_RECORDS;
    }

    const records: MonthSalaryRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as MonthSalaryRecord);
    });

    return records;
  } catch (error) {
    console.error('Error fetching salary records from Firestore:', error);
    return INITIAL_SALARY_RECORDS;
  }
}

export async function saveSalaryRecord(uid: string, record: MonthSalaryRecord): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'salaries', record.month);
    await setDoc(docRef, record, { merge: true });
  } catch (error) {
    console.error('Error saving salary record to Firestore:', error);
    throw error;
  }
}

// Seed initial demo data for new users
export async function seedInitialData(uid: string): Promise<void> {
  try {
    // Seed user profile
    const profileRef = doc(db, 'users', uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        ...INITIAL_USER_PROFILE,
        uid,
      });
    }

    // Seed salary records
    for (const record of INITIAL_SALARY_RECORDS) {
      const recordRef = doc(db, 'users', uid, 'salaries', record.month);
      await setDoc(recordRef, record, { merge: true });
    }
  } catch (error) {
    console.error('Error seeding initial data to Firestore:', error);
  }
}

// Auth Helper Functions
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
export type { User };
