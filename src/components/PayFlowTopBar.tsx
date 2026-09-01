import React from 'react';
import { ShieldCheck, Bell, MoreVertical, Moon, Sun } from 'lucide-react';
import { UserProfileData } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PayFlowTopBarProps {
  userProfile?: UserProfileData;
  activeMonthLabel?: string;
  onMenuPressed?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
  className?: string;
}

/**
 * PayFlowTopBar - Concept 2: Personalized Greeting & Status Bar (Revolut / Monzo Inspired)
 *
 * Features:
 * - Left: User Avatar + Dynamic Greeting ("Hey, Name 👋") + ID Badge only
 * - Right: Dark Mode Toggle + Salary Status Badge ("● Active") + Notification Bell with Badge + Subtle Three-Dot Menu
 * - Modern clean frosted glass finish with sleek emerald accents
 */
export const PayFlowTopBar: React.FC<PayFlowTopBarProps> = ({
  userProfile,
  activeMonthLabel,
  onMenuPressed,
  onProfileClick,
  onNotificationClick,
  unreadCount = 2,
  className = '',
}) => {
  const { isDark, toggleTheme } = useTheme();
  // Extract user first name for a warm, clean greeting
  const rawName = userProfile?.name || userProfile?.email?.split('@')[0] || 'Employee';
  const firstName = rawName.split(' ')[0] || rawName;
  const employeeId = userProfile?.pin || userProfile?.employeeId || '5556';

  return (
    <header
      id="payflow-top-bar-container"
      className={`sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#E6EFEA] shadow-[0_2px_12px_rgba(0,143,91,0.04)] px-3.5 sm:px-4 py-2.5 select-none flex items-center justify-between transition-all ${className}`}
    >
      {/* Left Side: Avatar + Personalized Greeting + Employee ID only */}
      <div
        id="payflow-user-greeting-left"
        onClick={onProfileClick}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        {/* User Avatar with verified emerald ring */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8F7F0] via-[#D0F0E2] to-[#B5E9D3] border-2 border-white shadow-sm flex items-center justify-center text-[#008F5B] font-extrabold text-sm overflow-hidden group-hover:scale-105 transition-transform">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={rawName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{firstName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {/* Active online status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#008F5B] border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Name & ID badge */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-[14px] sm:text-[15px] font-black text-[#17211D] tracking-tight truncate group-hover:text-[#008F5B] transition-colors">
              Hey, {firstName}
            </span>
            <span className="text-xs select-none">👋</span>
          </div>
          <div className="flex items-center text-[10.5px] leading-none mt-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#E8F7F0] text-[#008F5B] font-bold text-[9.5px] border border-[#C5EBDB]">
              ID: {employeeId}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Action Buttons in strict order: 1. Dark Mode, 2. Notification Bell, 3. Three-Dot Menu */}
      <div id="payflow-top-actions-right" className="flex items-center gap-1.5 shrink-0">
        {/* 1. Dark Mode Toggle Button */}
        <button
          type="button"
          id="payflow-quick-theme-toggle-btn"
          onClick={toggleTheme}
          className="w-8.5 h-8.5 rounded-full bg-white dark:bg-[#14241D] hover:bg-[#E8F7F0] dark:hover:bg-[#1F362B] active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer border border-[#E2ECE7] dark:border-[#243B2E] text-[#4A5550] dark:text-[#A1B3AA] hover:text-[#008F5B] dark:hover:text-[#10E594] shadow-2xs"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun size={16} className="text-[#F59E0B] stroke-[2.2]" />
          ) : (
            <Moon size={16} className="stroke-[2.2]" />
          )}
        </button>

        {/* 2. Notification Bell with Badge */}
        <button
          type="button"
          id="payflow-notification-btn"
          onClick={() => {
            if (onNotificationClick) onNotificationClick();
          }}
          className="w-8.5 h-8.5 rounded-full bg-white dark:bg-[#14241D] hover:bg-[#E8F7F0] dark:hover:bg-[#1F362B] active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer border border-[#E2ECE7] dark:border-[#243B2E] text-[#4A5550] dark:text-[#A1B3AA] hover:text-[#008F5B] dark:hover:text-[#10E594] shadow-2xs relative"
          aria-label="Notifications"
        >
          <Bell size={16} className="stroke-[2.2]" />
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D83B3B] text-white text-[9.5px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#17211D] shadow-2xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* 3. Three-Dot Menu Button */}
        <button
          type="button"
          id="payflow-top-menu-btn"
          onClick={() => {
            if (onMenuPressed) onMenuPressed();
          }}
          className="w-8.5 h-8.5 rounded-full bg-white dark:bg-[#14241D] hover:bg-[#E8F7F0] dark:hover:bg-[#1F362B] active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer border border-[#E2ECE7] dark:border-[#243B2E] text-[#4A5550] dark:text-[#A1B3AA] hover:text-[#008F5B] dark:hover:text-[#10E594] shadow-2xs"
          aria-label="Menu options"
        >
          <MoreVertical size={16} className="stroke-[2.2]" />
        </button>
      </div>
    </header>
  );
};

