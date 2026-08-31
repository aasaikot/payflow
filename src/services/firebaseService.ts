import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import { getDocFromServer } from 'firebase/firestore';
import { MonthSalaryRecord, UserProfileData } from '../types';
import {
  RAW_FIREBASE_DATA,
  convertFirebaseMonthsToRecords,
  convertFirebaseProfileToUser,
  FirebaseUserData,
  FirebaseMonthData,
} from '../mockData';

// Ensure user has a valid Firebase Auth session
export async function autoSignInIfGuest(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (error) {
    console.warn('Anonymous sign-in not available or skipped:', error);
    return null;
  }
}

// Google Sign-In with automated Profile & Photo sync
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfileData }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const uid = user.uid;
  const path = `users/${uid}`;

  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    let updatedProfile: UserProfileData;

    if (!snap.exists()) {
      // First time Google Sign-in: initialize user profile and empty months
      const newProfileData: FirebaseUserData['profile'] = {
        name: user.displayName || user.email?.split('@')[0]?.toUpperCase() || 'EMPLOYEE',
        companyName: '',
        designation: '',
        pin: '',
        email: user.email || '',
        mobile: user.phoneNumber || '',
        photoURL: user.photoURL || undefined,
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      };

      await setDoc(
        userDocRef,
        {
          profile: newProfileData,
          months: {},
        },
        { merge: true }
      );

      updatedProfile = convertFirebaseProfileToUser(newProfileData, uid);
    } else {
      // Existing user: preserve custom company details but update Google avatar & email if available
      const existingData = snap.data() as Partial<FirebaseUserData>;
      const existingProfile = existingData.profile || {
        name: user.displayName || 'EMPLOYEE',
        companyName: '',
        designation: '',
        pin: '',
        email: user.email || '',
        mobile: '',
        photoURL: user.photoURL || undefined,
        joinDate: '',
      };

      const mergedProfilePayload: FirebaseUserData['profile'] = {
        name: existingProfile.name || user.displayName || 'EMPLOYEE',
        companyName: existingProfile.companyName || '',
        designation: existingProfile.designation || '',
        pin: existingProfile.pin || '',
        email: user.email || existingProfile.email || '',
        mobile: existingProfile.mobile || '',
        photoURL: user.photoURL || existingProfile.photoURL,
        joinDate: existingProfile.joinDate || '',
      };

      await setDoc(userDocRef, { profile: mergedProfilePayload }, { merge: true });
      updatedProfile = convertFirebaseProfileToUser(mergedProfilePayload, uid);
    }

    return { user, profile: updatedProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    const fallbackProfile: UserProfileData = {
      uid,
      name: user.displayName || 'Employee',
      email: user.email || '',
      companyName: '',
      designation: '',
      pin: '',
      mobile: '',
      photoURL: user.photoURL || undefined,
      joinDate: '',
    };
    return { user, profile: fallbackProfile };
  }
}

// Validate Connection to Firestore as required by SKILL.md
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!auth.currentUser) return true;
    await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable.');
    }
    return false;
  }
}

// User Profile Service
export async function fetchUserProfile(uid: string): Promise<UserProfileData | null> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return convertFirebaseProfileToUser(RAW_FIREBASE_DATA.profile, uid || '5556');
  }

  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<FirebaseUserData>;
      if (data.profile) {
        return convertFirebaseProfileToUser(data.profile, uid);
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfileData): Promise<void> {
  if (!profile.uid || !auth.currentUser || auth.currentUser.uid !== profile.uid) {
    console.warn('Skipping saveUserProfile: user is not authenticated matching this UID');
    return;
  }

  const path = `users/${profile.uid}`;
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    const profilePayload: FirebaseUserData['profile'] = {
      name: profile.name,
      companyName: profile.companyName,
      designation: profile.designation,
      pin: profile.pin,
      email: profile.email,
      mobile: profile.mobile,
      photoURL: profile.photoURL,
      joinDate: profile.joinDate,
    };
    await setDoc(userDocRef, { profile: profilePayload }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Salary Records Service - reads and transforms exact Firebase document structure
export async function fetchSalaryRecords(uid: string): Promise<MonthSalaryRecord[]> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return convertFirebaseMonthsToRecords(RAW_FIREBASE_DATA.months);
  }

  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data() as Partial<FirebaseUserData>;
      if (data.months && Object.keys(data.months).length > 0) {
        return convertFirebaseMonthsToRecords(data.months);
      }
    }

    // If document is empty or new account, seed with exact user schema
    await seedInitialData(uid);
    return convertFirebaseMonthsToRecords(RAW_FIREBASE_DATA.months);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return convertFirebaseMonthsToRecords(RAW_FIREBASE_DATA.months);
  }
}

// Subscribe to realtime updates for a user's data
export function subscribeToUserData(
  uid: string,
  onData: (data: { profile: UserProfileData; records: MonthSalaryRecord[] }) => void,
  onError?: (err: unknown) => void
) {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return () => {};
  }

  const path = `users/${uid}`;
  const userDocRef = doc(db, 'users', uid);

  return onSnapshot(
    userDocRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<FirebaseUserData>;
        const profile = data.profile
          ? convertFirebaseProfileToUser(data.profile, uid)
          : convertFirebaseProfileToUser(RAW_FIREBASE_DATA.profile, uid);
        const records = data.months
          ? convertFirebaseMonthsToRecords(data.months)
          : convertFirebaseMonthsToRecords(RAW_FIREBASE_DATA.months);

        onData({ profile, records });
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        if (onError) onError(e);
      }
    }
  );
}

// Save or update a single month's salary record in the user document
export async function saveSalaryRecord(uid: string, record: MonthSalaryRecord): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    console.warn('Skipping remote saveSalaryRecord: user not authenticated');
    return;
  }

  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const monthData: FirebaseMonthData = {
      income: record.incomes,
      deduction: record.deductions,
      extraDeduction: record.extraDeduction || [],
      timestamp: Date.now(),
    };

    await setDoc(
      userDocRef,
      {
        months: {
          [record.month]: monthData,
        },
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Seed the complete real user dataset into Firebase Firestore
export async function seedInitialData(uid: string): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, RAW_FIREBASE_DATA, { merge: true });
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
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
};
export type { User };

