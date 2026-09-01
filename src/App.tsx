import React, { useState, useEffect } from 'react';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AndroidFrame } from './components/AndroidFrame';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { DashboardView } from './components/DashboardView';
import { SalaryHistoryView } from './components/SalaryHistoryView';
import { SalaryDetailsView } from './components/SalaryDetailsView';
import { ComparisonView } from './components/ComparisonView';
import { AddSalaryView } from './components/AddSalaryView';
import { ReportsView } from './components/ReportsView';
import { ProfileView } from './components/ProfileView';
import { BottomNavBar } from './components/BottomNavBar';
import { ScreenType, MonthSalaryRecord, UserProfileData } from './types';
import { INITIAL_SALARY_RECORDS, INITIAL_USER_PROFILE } from './mockData';
import {
  auth,
  signOut,
  onAuthStateChanged,
  fetchUserProfile,
  saveUserProfile,
  fetchSalaryRecords,
  saveSalaryRecord,
  deleteSalaryRecord,
  seedInitialData,
  testFirestoreConnection,
  subscribeToUserData,
  autoSignInIfGuest,
} from './services/firebaseService';
import { Smartphone, Code, CheckCircle, LogOut, Cloud, ShieldCheck } from 'lucide-react';
import {
  NotificationItem,
  INITIAL_NOTIFICATIONS,
} from './components/NotificationModal';

const NOTIFICATIONS_STORAGE_KEY = 'payflow_notifications_v1';

const getStoredNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load notifications from localStorage', e);
  }
  return INITIAL_NOTIFICATIONS;
};

const BLANK_USER_PROFILE: UserProfileData = {
  uid: '',
  name: '',
  email: '',
  companyName: '',
  designation: '',
  pin: '',
  mobile: '',
  joinDate: '',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState('2026-08');
  const [editSalaryMonth, setEditSalaryMonth] = useState<string | null>(null);
  const [salaryRecords, setSalaryRecords] = useState<MonthSalaryRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileData>(BLANK_USER_PROFILE);
  const [currentUid, setCurrentUid] = useState<string>('');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStoredNotifications());

  const handleUpdateNotifications = (updater: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save notifications', e);
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Test Firebase Firestore connection
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Sync auth state with Firebase and setup realtime listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUid(firebaseUser.uid);
        setIsFirebaseConnected(true);
        setCurrentScreen('dashboard');

        // Load isolated profile and salary records from Cache or Firestore
        const profile = await fetchUserProfile(firebaseUser.uid, firebaseUser.email || '');
        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({
            ...BLANK_USER_PROFILE,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0]?.toUpperCase() || 'USER',
          });
        }

        const records = await fetchSalaryRecords(firebaseUser.uid, firebaseUser.email || '');
        setSalaryRecords(records || []);
        if (records && records.length > 0) {
          setActiveMonth(records[0].month);
        }
      } else {
        // When not authenticated with Firebase Auth (e.g. initial load or logged out)
        setCurrentUid('');
        setUserProfile(BLANK_USER_PROFILE);
        setSalaryRecords([]);
        setCurrentScreen('login');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Subscribe to real-time updates for authenticated currentUid
  useEffect(() => {
    if (!currentUid || !auth.currentUser || auth.currentUser.uid !== currentUid) return;

    const unsubscribeRealtime = subscribeToUserData(
      currentUid,
      ({ profile, records }) => {
        if (profile) setUserProfile(profile);
        setSalaryRecords(records || []);
        if (records && records.length > 0) {
          setActiveMonth((prev) => (records.some((r) => r.month === prev) ? prev : records[0].month));
        }
      },
      (err) => {
        console.warn('Realtime sync note:', err);
      }
    );

    return () => unsubscribeRealtime();
  }, [currentUid]);

  const handleLoginSuccess = async (email: string, uid?: string) => {
    const effectiveUid = uid || auth.currentUser?.uid || currentUid;
    setCurrentUid(effectiveUid);

    // Try fetching remote or locally cached records
    try {
      const remoteProfile = await fetchUserProfile(effectiveUid, email);
      if (remoteProfile) {
        setUserProfile(remoteProfile);
      } else {
        setUserProfile((prev) => ({ ...prev, email, uid: effectiveUid }));
      }

      const records = await fetchSalaryRecords(effectiveUid, email);
      setSalaryRecords(records || []);
      if (records && records.length > 0) {
        setActiveMonth(records[0].month);
      }
    } catch (e) {
      console.error('Data load error on login:', e);
    }

    setCurrentScreen('dashboard');
    showToast(`স্বাগতম! সফলভাবে লগইন হয়েছে (${email})`);
  };

  const handleRegisterSuccess = async (email: string, uid?: string) => {
    const effectiveUid = uid || auth.currentUser?.uid || currentUid;
    setCurrentUid(effectiveUid);
    setUserProfile((prev) => ({ ...prev, email, uid: effectiveUid }));
    setSalaryRecords([]);
    setCurrentScreen('dashboard');
    showToast(`Account registered & synchronized with Firebase!`);
  };

  const handleSaveSalaryRecord = async (newRecord: MonthSalaryRecord) => {
    // Update local state immediately
    setSalaryRecords((prev) => {
      const idx = prev.findIndex((r) => r.month === newRecord.month);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newRecord;
        return updated;
      }
      return [newRecord, ...prev];
    });
    setActiveMonth(newRecord.month);

    // Save to Cache and Firebase Firestore
    try {
      await saveSalaryRecord(currentUid, newRecord, userProfile.email);
      showToast(`Salary for ${newRecord.monthLabel} saved & synced!`);
    } catch (e) {
      showToast(`Salary for ${newRecord.monthLabel} saved locally!`);
    }
  };

  const handleDeleteSalaryRecord = async (monthToDelete: string) => {
    const target = salaryRecords.find((r) => r.month === monthToDelete);
    const label = target?.monthLabel || monthToDelete;

    // Update local state immediately
    setSalaryRecords((prev) => {
      const updated = prev.filter((r) => r.month !== monthToDelete);
      if (activeMonth === monthToDelete) {
        if (updated.length > 0) {
          setActiveMonth(updated[0].month);
        } else {
          setActiveMonth('');
        }
      }
      return updated;
    });

    // Delete from Cache and Firebase Firestore
    try {
      if (currentUid) {
        await deleteSalaryRecord(currentUid, monthToDelete, userProfile.email);
        showToast(`Salary record for ${label} deleted successfully!`);
      } else {
        showToast(`Salary record for ${label} deleted locally.`);
      }
    } catch (e) {
      showToast(`Salary for ${label} removed.`);
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfileData) => {
    setUserProfile(updatedProfile);
    try {
      await saveUserProfile(updatedProfile);
      showToast('Profile updated & synced to Firestore!');
    } catch (e) {
      showToast('Profile updated successfully!');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignored
    }
    setCurrentScreen('login');
    showToast('Signed out successfully.');
  };

  const handleNavigate = (screen: ScreenType) => {
    if (screen === 'add') {
      // Clicking Add icon / navigation opens fresh New Entry Mode with a new month and blank fields
      setEditSalaryMonth(null);
    }
    setCurrentScreen(screen);
  };

  const activeRecord =
    salaryRecords.find((r) => r.month === activeMonth) || salaryRecords[0];

  const showBottomNav =
    currentScreen === 'dashboard' ||
    currentScreen === 'history' ||
    currentScreen === 'reports' ||
    currentScreen === 'profile' ||
    currentScreen === 'details' ||
    currentScreen === 'comparison';

  return (
    <div className="min-h-screen bg-[#F5FAF7] text-[#17211D] flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-5 z-50 bg-[#17211D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-bounce"
        >
          <CheckCircle size={16} className="text-[#008F5B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header */}
      <header className="w-full bg-white border-b border-[#D7E0DC] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="PayFlow"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.className =
                      'w-8 h-8 rounded-lg bg-[#008F5B] text-white flex items-center justify-center font-bold text-base shadow-xs';
                    target.parentElement.innerHTML = '<span>P</span>';
                  }
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm text-[#17211D]">Pay</span>
                <span className="font-extrabold text-sm text-[#008F5B]">Flow</span>
                <span className="text-[10px] bg-[#E9F7F1] text-[#008F5B] font-bold px-2 py-0.5 rounded-full ml-1 border border-[#008F5B]/20 flex items-center gap-1">
                  <Cloud size={10} />
                  <span>Firebase Connected</span>
                </span>
              </div>
              <span className="text-[11px] text-[#6E7974] font-medium block mt-0.5">
                Pixel-Accurate Flutter Android Application • Firestore Backend
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#F5FAF7] rounded-xl border border-[#D7E0DC]">
              <button
                id="toggle-preview-mode-btn"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#008F5B] text-white shadow-xs'
                    : 'text-[#6E7974] hover:text-[#17211D]'
                }`}
              >
                <Smartphone size={14} />
                <span>Android UI View</span>
              </button>
              <button
                id="toggle-code-mode-btn"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'code'
                    ? 'bg-[#008F5B] text-white shadow-xs'
                    : 'text-[#6E7974] hover:text-[#17211D]'
                }`}
              >
                <Code size={14} />
                <span>Flutter / Dart Code</span>
              </button>
            </div>

            {currentScreen !== 'login' && currentScreen !== 'register' && (
              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D7E0DC] text-xs font-semibold text-[#D83B3B] hover:bg-[#D83B3B]/10 transition-all cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-6xl mx-auto flex-1 p-1 sm:p-5 flex flex-col items-center justify-center">
        {viewMode === 'preview' ? (
          <AndroidFrame
            activeScreen={currentScreen}
            onSelectScreen={(screen) => setCurrentScreen(screen)}
          >
            {/* Screen Router */}
            <div className="flex-1 flex flex-col justify-between">
              {currentScreen === 'login' && (
                <LoginView
                  onNavigateToRegister={() => setCurrentScreen('register')}
                  onForgotPassword={() => setIsForgotPasswordOpen(true)}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}

              {currentScreen === 'register' && (
                <RegisterView
                  onNavigateToLogin={() => setCurrentScreen('login')}
                  onRegisterSuccess={handleRegisterSuccess}
                />
              )}

              {currentScreen === 'dashboard' && (
                <DashboardView
                  userProfile={userProfile}
                  salaryRecords={salaryRecords}
                  activeMonth={activeMonth}
                  onSelectMonth={(m) => setActiveMonth(m)}
                  onNavigate={handleNavigate}
                  notifications={notifications}
                  onUpdateNotifications={handleUpdateNotifications}
                />
              )}

              {currentScreen === 'history' && (
                <SalaryHistoryView
                  salaryRecords={salaryRecords}
                  userProfile={userProfile}
                  activeMonth={activeMonth}
                  onSelectMonth={(m) => setActiveMonth(m)}
                  onNavigate={handleNavigate}
                  onDeleteRecord={handleDeleteSalaryRecord}
                />
              )}

              {currentScreen === 'details' && (
                <SalaryDetailsView
                  record={activeRecord}
                  salaryRecords={salaryRecords}
                  userProfile={userProfile}
                  onNavigate={handleNavigate}
                  onEditMonth={(m) => {
                    setActiveMonth(m);
                    setEditSalaryMonth(m);
                    setCurrentScreen('add');
                  }}
                  onDeleteRecord={handleDeleteSalaryRecord}
                />
              )}

              {currentScreen === 'comparison' && (
                <ComparisonView
                  salaryRecords={salaryRecords}
                  activeMonth={activeMonth}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'add' && (
                <AddSalaryView
                  key={`add-view-${editSalaryMonth || 'new'}-${salaryRecords.length}`}
                  initialMonth={editSalaryMonth || undefined}
                  existingRecords={salaryRecords}
                  onSaveRecord={handleSaveSalaryRecord}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'reports' && (
                <ReportsView
                  salaryRecords={salaryRecords}
                  activeMonth={activeMonth}
                  onSelectMonth={(m) => setActiveMonth(m)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'profile' && (
                <ProfileView
                  userProfile={userProfile}
                  salaryRecords={salaryRecords}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              )}
            </div>

            {/* Bottom Nav Bar (docked on screens) */}
            {showBottomNav && (
              <BottomNavBar
                currentScreen={currentScreen}
                onSelectScreen={handleNavigate}
              />
            )}
          </AndroidFrame>
        ) : (
          <div className="w-full max-w-5xl h-[700px]">
            <FlutterCodeViewer />
          </div>
        )}
      </main>

      {/* Forgot Password Dialog */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
