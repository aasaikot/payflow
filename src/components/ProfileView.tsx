import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  Edit3,
  LogOut,
  Camera,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Fingerprint,
  Loader2,
  Info,
} from 'lucide-react';
import { UserProfileData, MonthSalaryRecord, ScreenType } from '../types';
import {
  registerBiometrics,
  isBiometricRegisteredForUser,
  removeBiometricForUser,
  saveBiometricDirectly,
  isInIFrame,
} from '../services/biometricService';
import { setUserLocalCache } from '../services/firebaseService';
import { FingerprintPromptModal } from './FingerprintPromptModal';

interface ProfileViewProps {
  userProfile: UserProfileData;
  salaryRecords?: MonthSalaryRecord[];
  onUpdateProfile: (profile: UserProfileData) => void;
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  salaryRecords = [],
  onUpdateProfile,
  onLogout,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileData>({ ...userProfile });
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Biometrics State
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricSettingUp, setIsBiometricSettingUp] = useState<boolean>(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [biometricFeedback, setBiometricFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setIsBiometricEnabled(
      isBiometricRegisteredForUser(userProfile.uid, userProfile.email)
    );
  }, [userProfile.uid, userProfile.email]);

  const handleEnableBiometric = async () => {
    setBiometricFeedback(null);

    // If inside an iframe sandbox or user needs clear UI touch prompt, open interactive modal
    if (isInIFrame()) {
      setIsPromptModalOpen(true);
      return;
    }

    setIsBiometricSettingUp(true);
    try {
      const res = await registerBiometrics(
        userProfile.uid,
        userProfile.email,
        userProfile.name
      );
      if (res.success) {
        setIsBiometricEnabled(true);
        setUserLocalCache(userProfile.uid, userProfile.email, userProfile, salaryRecords);
        setBiometricFeedback({ type: 'success', message: res.message });
      } else {
        // If native prompt fails due to security/timeout, offer interactive modal
        setIsPromptModalOpen(true);
      }
    } catch (e: any) {
      setIsPromptModalOpen(true);
    } finally {
      setIsBiometricSettingUp(false);
    }
  };

  const handleModalSuccess = () => {
    setIsPromptModalOpen(false);
    const res = saveBiometricDirectly(
      userProfile.uid,
      userProfile.email,
      userProfile.name
    );
    if (res.success) {
      setIsBiometricEnabled(true);
      setUserLocalCache(userProfile.uid, userProfile.email, userProfile, salaryRecords);
      setBiometricFeedback({
        type: 'success',
        message: 'ফিঙ্গারপ্রিন্ট সফলভাবে সক্রিয় (ON) হয়েছে! এখন লগইন স্ক্রিনে ফিঙ্গারপ্রিন্ট দিয়ে ঢুকতে পারবেন।',
      });
    }
  };

  const handleDisableBiometric = () => {
    removeBiometricForUser(userProfile.uid);
    setIsBiometricEnabled(false);
    setBiometricFeedback({
      type: 'success',
      message: 'এই ডিভাইসে ফিঙ্গারপ্রিন্ট লগইন বন্ধ করা হয়েছে।',
    });
  };

  // Suggested preset avatars for quick pick
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updated = { ...userProfile, photoURL: base64String };
        setEditForm({ ...editForm, photoURL: base64String });
        onUpdateProfile(updated);
        setIsPhotoPickerOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    const updated = { ...userProfile, photoURL: url };
    setEditForm({ ...editForm, photoURL: url });
    onUpdateProfile(updated);
    setIsPhotoPickerOpen(false);
  };

  const handleSaveUrlPhoto = () => {
    if (photoUrlInput.trim()) {
      const updated = { ...userProfile, photoURL: photoUrlInput.trim() };
      setEditForm({ ...editForm, photoURL: photoUrlInput.trim() });
      onUpdateProfile(updated);
      setPhotoUrlInput('');
      setIsPhotoPickerOpen(false);
    }
  };

  const handleRemovePhoto = () => {
    const fallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const updated = { ...userProfile, photoURL: fallback };
    setEditForm({ ...editForm, photoURL: fallback });
    onUpdateProfile(updated);
    setIsPhotoPickerOpen(false);
  };

  return (
    <div id="profile-view-screen" className="w-full flex flex-col pb-6">
      {/* Hidden File Input for Device Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 bg-white border-b border-[#E4ECE8] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="profile-back-btn"
            onClick={() => onNavigate('dashboard')}
            className="w-9 h-9 rounded-full bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#17211D] hover:bg-[#E9F7F1] transition-all cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-extrabold text-[#17211D] tracking-tight">
            Profile
          </h1>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* User Identity Section */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Camera Overlay (Opens Photo Change Sheet) */}
          <div className="relative mb-3 group">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#008F5B]/25 overflow-hidden shadow-md bg-[#F5FAF7]">
              <img
                src={
                  userProfile.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={userProfile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              id="open-change-photo-btn"
              type="button"
              onClick={() => setIsPhotoPickerOpen(true)}
              className="w-8 h-8 rounded-full bg-[#008F5B] hover:bg-[#007A4D] text-white border-2 border-white absolute bottom-0 right-0 flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95"
              aria-label="Change photo"
              title="Change Profile Photo"
            >
              <Camera size={15} />
            </button>
          </div>

          <h2 className="text-[19px] font-extrabold text-[#17211D] tracking-tight">
            {userProfile.name}
          </h2>
          <p className="text-[13px] text-[#6E7974] font-medium mt-0.5">
            {userProfile.designation}
          </p>
          <div className="mt-1.5 px-3 py-0.5 rounded-full bg-[#E9F7F1] border border-[#008F5B]/20 text-[11px] font-mono text-[#008F5B] font-bold">
            PIN: {userProfile.pin}
          </div>
        </div>

        {/* Profile Details Card */}
        <div
          id="profile-info-list-card"
          className="w-full bg-white rounded-xl p-5 border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)] flex flex-col gap-4"
        >
          {/* Company */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#008F5B]">
              <Building2 size={18} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-[#8A9791] uppercase font-bold tracking-wider block">
                Company
              </span>
              <strong className="text-[13px] font-semibold text-[#17211D] block">
                {userProfile.companyName}
              </strong>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#008F5B]">
              <Mail size={18} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-[#8A9791] uppercase font-bold tracking-wider block">
                Email
              </span>
              <strong className="text-[13px] font-semibold text-[#17211D] block">
                {userProfile.email}
              </strong>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#008F5B]">
              <Phone size={18} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-[#8A9791] uppercase font-bold tracking-wider block">
                Phone
              </span>
              <strong className="text-[13px] font-semibold text-[#17211D] block">
                {userProfile.mobile}
              </strong>
            </div>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] flex items-center justify-center text-[#008F5B]">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-[#8A9791] uppercase font-bold tracking-wider block">
                Join Date
              </span>
              <strong className="text-[13px] font-semibold text-[#17211D] block">
                {userProfile.joinDate}
              </strong>
            </div>
          </div>
        </div>

        {/* Biometric & Security Settings Card with Modern ON/OFF Toggle Switch */}
        <div
          id="profile-biometric-card"
          className="w-full bg-white rounded-xl p-4 sm:p-5 border border-[#E4ECE8] shadow-[0_4px_16px_rgba(23,33,29,0.02)] flex flex-col gap-2"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isBiometricEnabled
                  ? 'bg-[#E9F7F1] border border-[#008F5B]/30 text-[#008F5B]'
                  : 'bg-[#F5FAF7] border border-[#E4ECE8] text-[#8A9791]'
              }`}>
                <Fingerprint size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-extrabold text-[#17211D] flex items-center gap-2">
                  <span>Fingerprint Login</span>
                  <span
                    className={`text-[9px] px-2 py-0.2 rounded-full font-bold tracking-wider uppercase transition-colors ${
                      isBiometricEnabled
                        ? 'bg-[#008F5B] text-white shadow-2xs'
                        : 'bg-[#E4ECE8] text-[#6E7974]'
                    }`}
                  >
                    {isBiometricEnabled ? 'ON' : 'OFF'}
                  </span>
                </h3>
              </div>
            </div>

            {/* Modern ON / OFF Switch Toggle */}
            <button
              type="button"
              id="biometric-toggle-switch"
              role="switch"
              aria-checked={isBiometricEnabled}
              disabled={isBiometricSettingUp}
              onClick={() => {
                if (isBiometricEnabled) {
                  handleDisableBiometric();
                } else {
                  handleEnableBiometric();
                }
              }}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-60 ${
                isBiometricEnabled ? 'bg-[#008F5B]' : 'bg-[#D1DDD7]'
              }`}
              title={isBiometricEnabled ? 'Turn OFF Fingerprint Login' : 'Turn ON Fingerprint Login'}
            >
              <span className="sr-only">Toggle Fingerprint Login</span>
              <span
                className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isBiometricEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              >
                {isBiometricSettingUp ? (
                  <Loader2 size={11} className="animate-spin text-[#008F5B]" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isBiometricEnabled ? 'bg-[#008F5B]' : 'bg-[#A0AEA7]'
                    }`}
                  />
                )}
              </span>
            </button>
          </div>

          {biometricFeedback && (
            <div
              className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 mt-1 ${
                biometricFeedback.type === 'success'
                  ? 'bg-[#E9F7F1] text-[#008F5B] border border-[#008F5B]/25'
                  : 'bg-[#FEF2F2] text-[#D83B3B] border border-[#D83B3B]/25'
              }`}
            >
              <Info size={14} className="shrink-0" />
              <span>{biometricFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Edit Profile & Logout */}
        <div className="flex gap-3 mt-1">
          <button
            id="open-edit-profile-btn"
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 h-12 bg-white hover:bg-[#E9F7F1]/50 border border-[#008F5B] text-[#008F5B] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>

          <button
            id="profile-logout-btn"
            type="button"
            onClick={onLogout}
            className="flex-1 h-12 bg-white hover:bg-[#D83B3B]/10 border border-[#D83B3B] text-[#D83B3B] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl border border-[#D7E0DC] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#17211D]">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-[#F5FAF7] flex items-center justify-center text-[#6E7974]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              {/* Profile Avatar Change Preview Inside Edit Modal */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8]">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#008F5B] shrink-0 bg-white">
                  <img
                    src={editForm.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={editForm.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#8A9791] font-bold uppercase block">Profile Picture</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setIsPhotoPickerOpen(true);
                    }}
                    className="text-xs font-bold text-[#008F5B] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Camera size={13} />
                    <span>Change Picture</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Employee PIN
                </label>
                <input
                  type="text"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1">
                  Mobile
                </label>
                <input
                  type="text"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B]"
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-10 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#6E7974] hover:bg-[#F5FAF7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-[#008F5B] text-white text-xs font-bold hover:bg-[#007A4D]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Picker & Camera Options Modal */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#D7E0DC] max-h-[90vh] overflow-y-auto">
            {/* Sheet Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E4ECE8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E9F7F1] text-[#008F5B] flex items-center justify-center">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#17211D]">
                    Profile Picture
                  </h3>
                  <p className="text-[11px] text-[#6E7974]">
                    Upload custom photo or choose an avatar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5FAF7] hover:bg-[#EAEFEA] flex items-center justify-center text-[#6E7974] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Active Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#F5FAF7] border border-[#E4ECE8] mb-4">
              <div className="w-14 h-14 rounded-full ring-2 ring-[#008F5B] overflow-hidden bg-white shrink-0 shadow-xs">
                <img
                  src={
                    userProfile.photoURL ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-[#8A9791] uppercase font-bold tracking-wider block">
                  Current Picture
                </span>
                <span className="text-xs font-bold text-[#17211D] truncate block">
                  {userProfile.name}
                </span>
              </div>
            </div>

            {/* Upload from Gallery / Device Button */}
            <button
              type="button"
              id="upload-device-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 bg-[#008F5B] hover:bg-[#007A4D] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mb-3"
            >
              <Upload size={16} />
              <span>Upload Photo from Device</span>
            </button>

            {/* Presets Grid */}
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2.5">
                <Sparkles size={13} className="text-[#008F5B]" />
                <span className="text-[11px] font-bold text-[#17211D] uppercase tracking-wide">
                  Choose from Avatars
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {avatarPresets.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(presetUrl)}
                    className="relative aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-[#008F5B] hover:scale-105 transition-all group focus:border-[#008F5B]"
                  >
                    <img
                      src={presetUrl}
                      alt={`Avatar ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {userProfile.photoURL === presetUrl && (
                      <div className="absolute inset-0 bg-[#008F5B]/40 flex items-center justify-center">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Paste Image URL section */}
            <div className="pt-3 border-t border-[#E4ECE8]">
              <label className="block text-[11px] font-bold text-[#6E7974] uppercase mb-1.5">
                Or Paste Image Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 h-10 px-3 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#17211D] outline-none focus:border-[#008F5B] bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveUrlPhoto}
                  disabled={!photoUrlInput.trim()}
                  className="px-3.5 h-10 rounded-xl bg-[#17211D] hover:bg-black text-white text-xs font-bold disabled:opacity-40 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Reset / Remove Photo */}
            <div className="mt-4 pt-3 border-t border-[#E4ECE8] flex items-center justify-between">
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-[11.5px] font-bold text-[#D83B3B] hover:underline flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="px-4 h-9 rounded-xl border border-[#D7E0DC] text-xs font-semibold text-[#6E7974] hover:bg-[#F5FAF7]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Biometric Setup Modal */}
      <FingerprintPromptModal
        isOpen={isPromptModalOpen}
        mode="enroll"
        userEmail={userProfile.email}
        userName={userProfile.name}
        onSuccess={handleModalSuccess}
        onCancel={() => setIsPromptModalOpen(false)}
      />
    </div>
  );
};
