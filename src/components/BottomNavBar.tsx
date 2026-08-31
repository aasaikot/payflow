import React from 'react';
import { motion } from 'motion/react';
import { Clock, User } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Main Navigation"
      className="w-full bg-white/95 backdrop-blur-xl border-t border-[#E3EAE6] select-none sticky bottom-0 z-30 shadow-[0_-8px_30px_rgba(0,35,20,0.06)]"
    >
      <div className="w-full max-w-md mx-auto px-1 sm:px-2 py-1.5 flex items-center justify-between relative">
        {/* 1. HOME TAB */}
        <button
          id="nav-item-dashboard"
          type="button"
          onClick={() => onSelectScreen('dashboard')}
          className="flex-1 flex flex-col items-center justify-center py-1.5 relative group cursor-pointer focus:outline-none"
        >
          <div className="h-6 flex items-center justify-center">
            {/* Solid Filled Home Icon */}
            <svg
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                currentScreen === 'dashboard' ? 'text-[#00B377]' : 'text-[#475569]'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11.293 2.293a1 1 0 0 1 1.414 0l9 9A1 1 0 0 1 21 13h-1v7a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-4h-2v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-7H3a1 1 0 0 1-.707-1.707l9-9z" />
            </svg>
          </div>

          <span
            className={`text-[11.5px] mt-0.5 font-semibold transition-colors duration-200 leading-tight ${
              currentScreen === 'dashboard' ? 'text-[#1E293B] font-bold' : 'text-[#475569]'
            }`}
          >
            Home
          </span>

          {/* Active Horizontal Green Line Indicator */}
          <div className="h-1.5 flex items-center justify-center mt-1">
            {currentScreen === 'dashboard' ? (
              <motion.div
                layoutId="bottomNavIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="w-7 h-[3.5px] bg-[#00B377] rounded-full shadow-[0_1px_4px_rgba(0,179,119,0.4)]"
              />
            ) : (
              <div className="w-7 h-[3.5px] bg-transparent" />
            )}
          </div>
        </button>

        {/* Divider 1 */}
        <div className="w-[1px] h-8 bg-[#EDF2F0] shrink-0" />

        {/* 2. HISTORY TAB */}
        <button
          id="nav-item-history"
          type="button"
          onClick={() => onSelectScreen('history')}
          className="flex-1 flex flex-col items-center justify-center py-1.5 relative group cursor-pointer focus:outline-none"
        >
          <div className="h-6 flex items-center justify-center">
            <Clock
              size={21}
              strokeWidth={currentScreen === 'history' ? 2.6 : 2}
              className={`transition-transform duration-200 group-hover:scale-105 ${
                currentScreen === 'history' ? 'text-[#00B377]' : 'text-[#475569]'
              }`}
            />
          </div>

          <span
            className={`text-[11.5px] mt-0.5 font-semibold transition-colors duration-200 leading-tight ${
              currentScreen === 'history' ? 'text-[#1E293B] font-bold' : 'text-[#475569]'
            }`}
          >
            History
          </span>

          <div className="h-1.5 flex items-center justify-center mt-1">
            {currentScreen === 'history' ? (
              <motion.div
                layoutId="bottomNavIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="w-7 h-[3.5px] bg-[#00B377] rounded-full shadow-[0_1px_4px_rgba(0,179,119,0.4)]"
              />
            ) : (
              <div className="w-7 h-[3.5px] bg-transparent" />
            )}
          </div>
        </button>

        {/* Divider 2 */}
        <div className="w-[1px] h-8 bg-[#EDF2F0] shrink-0" />

        {/* 3. CENTER FLOATING DIAMOND ADD BUTTON */}
        <div className="flex-1 flex flex-col items-center justify-center relative -mt-6 sm:-mt-7 z-20">
          <motion.button
            id="nav-item-add"
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06, y: -2 }}
            transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            onClick={() => onSelectScreen('add')}
            aria-label="Add Salary Slip"
            className="relative group cursor-pointer focus:outline-none flex flex-col items-center"
          >
            {/* White Soft Outer Glow / Background Ring */}
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-[22px] rotate-45 bg-white shadow-[0_8px_24px_rgba(0,179,119,0.32),0_2px_8px_rgba(0,0,0,0.06)] p-0.5 flex items-center justify-center">
              {/* Diamond Gradient Container */}
              <div
                className={`w-full h-full rounded-[19px] flex items-center justify-center bg-gradient-to-br from-[#1AD69E] via-[#00B377] to-[#009E68] transition-all duration-300 ${
                  currentScreen === 'add'
                    ? 'ring-2 ring-[#00B377]/40 from-[#20E2A8] via-[#00C282] to-[#009460]'
                    : 'group-hover:from-[#20E2A8] group-hover:to-[#00A86F]'
                }`}
              >
                {/* Upright Center Plus Icon (Counter Rotated) */}
                <div className="-rotate-45 flex items-center justify-center">
                  <svg
                    className={`w-6 h-6 text-white transition-transform duration-300 drop-shadow-xs ${
                      currentScreen === 'add' ? 'rotate-45 scale-110' : 'group-hover:rotate-90'
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </div>
            </div>

            <span className="text-[12px] mt-1 font-bold text-[#00B377] tracking-tight leading-tight group-hover:text-[#009E68] transition-colors">
              Add
            </span>
          </motion.button>
        </div>

        {/* Divider 3 */}
        <div className="w-[1px] h-8 bg-[#EDF2F0] shrink-0" />

        {/* 4. ANALYTICS / REPORTS TAB */}
        <button
          id="nav-item-reports"
          type="button"
          onClick={() => onSelectScreen('reports')}
          className="flex-1 flex flex-col items-center justify-center py-1.5 relative group cursor-pointer focus:outline-none"
        >
          <div className="h-6 flex items-center justify-center">
            {/* 3-Bar Chart Icon matching the reference image */}
            <svg
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                currentScreen === 'reports' ? 'text-[#00B377]' : 'text-[#475569]'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="4" y="11" width="3.5" height="9" rx="1.75" />
              <rect x="10.25" y="6" width="3.5" height="14" rx="1.75" />
              <rect x="16.5" y="2" width="3.5" height="18" rx="1.75" />
            </svg>
          </div>

          <span
            className={`text-[11.5px] mt-0.5 font-semibold transition-colors duration-200 leading-tight ${
              currentScreen === 'reports' ? 'text-[#1E293B] font-bold' : 'text-[#475569]'
            }`}
          >
            Analytics
          </span>

          <div className="h-1.5 flex items-center justify-center mt-1">
            {currentScreen === 'reports' ? (
              <motion.div
                layoutId="bottomNavIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="w-7 h-[3.5px] bg-[#00B377] rounded-full shadow-[0_1px_4px_rgba(0,179,119,0.4)]"
              />
            ) : (
              <div className="w-7 h-[3.5px] bg-transparent" />
            )}
          </div>
        </button>

        {/* Divider 4 */}
        <div className="w-[1px] h-8 bg-[#EDF2F0] shrink-0" />

        {/* 5. PROFILE TAB */}
        <button
          id="nav-item-profile"
          type="button"
          onClick={() => onSelectScreen('profile')}
          className="flex-1 flex flex-col items-center justify-center py-1.5 relative group cursor-pointer focus:outline-none"
        >
          <div className="h-6 flex items-center justify-center">
            <User
              size={21}
              strokeWidth={currentScreen === 'profile' ? 2.6 : 2}
              className={`transition-transform duration-200 group-hover:scale-105 ${
                currentScreen === 'profile' ? 'text-[#00B377]' : 'text-[#475569]'
              }`}
            />
          </div>

          <span
            className={`text-[11.5px] mt-0.5 font-semibold transition-colors duration-200 leading-tight ${
              currentScreen === 'profile' ? 'text-[#1E293B] font-bold' : 'text-[#475569]'
            }`}
          >
            Profile
          </span>

          <div className="h-1.5 flex items-center justify-center mt-1">
            {currentScreen === 'profile' ? (
              <motion.div
                layoutId="bottomNavIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="w-7 h-[3.5px] bg-[#00B377] rounded-full shadow-[0_1px_4px_rgba(0,179,119,0.4)]"
              />
            ) : (
              <div className="w-7 h-[3.5px] bg-transparent" />
            )}
          </div>
        </button>
      </div>
    </nav>
  );
};
