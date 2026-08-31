import React, { useState } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone } from 'lucide-react';
import { ScreenType } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeScreen,
  onSelectScreen,
}) => {
  const [deviceWidth, setDeviceWidth] = useState<'390' | '412' | '440' | 'full'>('full');

  const getContainerWidth = () => {
    switch (deviceWidth) {
      case '390':
        return 'max-w-[390px]';
      case '412':
        return 'max-w-[412px]';
      case '440':
        return 'max-w-[440px]';
      case 'full':
        return 'w-full max-w-[445px]';
      default:
        return 'w-full max-w-[445px]';
    }
  };

  const screenTabs: { id: ScreenType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'History' },
    { id: 'details', label: 'Details' },
    { id: 'comparison', label: 'Comparison' },
    { id: 'add', label: 'Add Salary' },
    { id: 'reports', label: 'Reports' },
    { id: 'profile', label: 'Profile' },
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* Device Toolbar / Screen Mode Switcher */}
      <div className="w-full max-w-2xl flex flex-col gap-2.5 mb-3 px-1 sm:px-2 select-none">
        {/* Screen Picker Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#D7E0DC] shadow-2xs overflow-x-auto no-scrollbar">
          {screenTabs.map((tab) => (
            <button
              key={tab.id}
              id={`screen-tab-${tab.id}`}
              onClick={() => onSelectScreen(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeScreen === tab.id
                  ? 'bg-[#008F5B] text-white shadow-xs'
                  : 'text-[#6E7974] hover:text-[#17211D] hover:bg-[#F5FAF7]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewport Width Preset Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-[#6E7974] font-medium">
            Active Screen:{' '}
            <strong className="text-[#008F5B] uppercase font-extrabold tracking-wide">
              {activeScreen}
            </strong>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D7E0DC] text-xs">
            <span className="text-[11px] font-semibold text-[#6E7974] px-1.5 flex items-center gap-1">
              <Smartphone size={13} />
              Target:
            </span>
            {(['390', '412', '440', 'full'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setDeviceWidth(w)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  deviceWidth === w
                    ? 'bg-[#E9F7F1] text-[#008F5B] font-bold'
                    : 'text-[#6E7974] hover:text-[#17211D]'
                }`}
              >
                {w === 'full' ? 'Auto' : `${w}dp`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Android Device Mockup Frame */}
      <div
        id="android-phone-frame"
        className={`w-full ${getContainerWidth()} bg-white rounded-[32px] sm:rounded-[38px] border-[5px] sm:border-[7px] border-[#17211D] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-200 flex flex-col relative`}
      >
        {/* Android Status Bar */}
        <div
          id="android-status-bar"
          className="w-full bg-[#F5FAF7] px-6 pt-2.5 pb-1 flex items-center justify-between text-[#17211D] select-none text-[12px] font-semibold tracking-tight shrink-0 z-20 border-b border-[#E4ECE8]/40"
        >
          <span>9:41</span>
          <div className="w-4 h-4 rounded-full bg-[#17211D]/15 mx-auto -mr-2" />
          <div className="flex items-center gap-2 text-[#17211D]">
            <Signal size={13} />
            <Wifi size={13} />
            <BatteryMedium size={15} />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="w-full bg-[#F5FAF7] min-h-[640px] max-h-[76vh] overflow-y-auto flex-1 relative flex flex-col justify-between">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="w-full bg-white py-2 flex justify-center items-center select-none border-t border-[#E4ECE8]/50 shrink-0">
          <div className="w-28 h-1 bg-[#17211D]/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
