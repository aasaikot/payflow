import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  History,
  Plus,
  BarChart3,
  User,
} from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onSelectScreen,
}) => {
  const navItems: {
    id: ScreenType;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
    isSpecialAction?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'add', label: 'Add Slip', icon: Plus, isSpecialAction: true },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Main Navigation"
      className="w-full bg-white/95 backdrop-blur-xl border-t border-[#E2EAE5] select-none sticky bottom-0 z-30 shadow-[0_-4px_24px_rgba(0,35,20,0.04)]"
    >
      <div className="w-full max-w-lg mx-auto flex items-stretch justify-between px-1.5 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          const isAction = item.isSpecialAction;

          if (isAction) {
            return (
              <motion.button
                key={item.id}
                id={`nav-item-${item.id}`}
                type="button"
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => onSelectScreen(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative group cursor-pointer"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isActive
                      ? 'bg-[#008F5B] text-white shadow-[#008F5B]/30 shadow-md ring-2 ring-[#008F5B]/20'
                      : 'bg-[#E9F7F1] text-[#008F5B] group-hover:bg-[#008F5B] group-hover:text-white'
                  }`}
                >
                  <Plus
                    size={20}
                    strokeWidth={2.8}
                    className={`transition-transform duration-300 ${
                      isActive ? 'rotate-45' : 'group-hover:rotate-90'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight transition-colors duration-200 ${
                    isActive
                      ? 'font-bold text-[#008F5B]'
                      : 'font-semibold text-[#667A72] group-hover:text-[#008F5B]'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.id}
              id={`nav-item-${item.id}`}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelectScreen(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative group cursor-pointer"
            >
              {/* Top Accent Active Line with Layout Transition */}
              {isActive && (
                <motion.div
                  layoutId="activeNavTopLine"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute top-0 inset-x-3 h-[2.5px] bg-[#008F5B] rounded-full shadow-[0_2px_8px_rgba(0,143,91,0.4)]"
                />
              )}

              {/* Icon Container with Smooth Micro-Bounce */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`p-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-[#008F5B]'
                    : 'text-[#7A8E85] group-hover:text-[#182620]'
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.6 : 2}
                  className="drop-shadow-xs"
                />
              </motion.div>

              {/* Text Label */}
              <span
                className={`text-[10px] tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'font-bold text-[#008F5B]'
                    : 'font-semibold text-[#7A8E85] group-hover:text-[#182620]'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

