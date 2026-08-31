import React, { useState } from 'react';
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
} from 'lucide-react';
import { UserProfileData, ScreenType } from '../types';

interface ProfileViewProps {
  userProfile: UserProfileData;
  onUpdateProfile: (profile: UserProfileData) => void;
  onLogout: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  onLogout,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileData>({ ...userProfile });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div id="profile-view-screen" className="w-full flex flex-col pb-6">
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
          {/* Avatar with Camera Overlay */}
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#008F5B]/20 overflow-hidden shadow-md">
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
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-7 h-7 rounded-full bg-[#008F5B] text-white border-2 border-white absolute bottom-0 right-0 flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#007A4D] transition-colors"
              aria-label="Change photo"
            >
              <Camera size={14} />
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
    </div>
  );
};
