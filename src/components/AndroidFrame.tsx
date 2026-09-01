import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isNativeOrMobile, setIsNativeOrMobile] = useState<boolean>(false);
  const [forceFullScreen, setForceFullScreen] = useState<boolean>(false);

  useEffect(() => {
    const checkEnvironment = () => {
      // Check if running in Capacitor native app, mobile user-agent, or mobile screen width
      const isCapacitor = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })?.Capacitor?.isNativePlatform?.() || !!(window as unknown as { Capacitor?: unknown })?.Capacitor;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;

      setIsNativeOrMobile(isCapacitor || isMobileUA || isSmallScreen);
    };

    checkEnvironment();
    window.addEventListener('resize', checkEnvironment);
    return () => window.removeEventListener('resize', checkEnvironment);
  }, []);

  // If in native mobile app or small screen or user enabled full-screen mode, render 100% native layout
  if (isNativeOrMobile || forceFullScreen) {
    return (
      <div className="w-full min-h-screen bg-[#F5FAF7] dark:bg-[#0E1814] flex flex-col justify-between overflow-x-hidden">
        {children}
      </div>
    );
  }

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
      {/* Device Toolbar / Screen Mode Switcher (Desktop Only) */}
      <div className="w-full max-w-2xl flex flex-col gap-2.5 mb-3 px-1 sm:px-2 select-none">
        {/* Screen Picker Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#14221C] rounded-xl border border-[#D7E0DC] dark:border-[#21352C] shadow-2xs overflow-x-auto no-scrollbar">
          {screenTabs.map((tab) => (
            <button
              key={tab.id}
              id={`screen-tab-${tab.id}`}
              onClick={() => onSelectScreen(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeScreen === tab.id
                  ? 'bg-[#008F5B] text-white shadow-xs'
                  : 'text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-white hover:bg-[#F5FAF7] dark:hover:bg-[#1C2F26]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewport Width Preset Buttons */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-[#6E7974] dark:text-[#9DB3A8] font-medium">
            Active Screen:{' '}
            <strong className="text-[#008F5B] dark:text-[#10E594] uppercase font-extrabold tracking-wide">
              {activeScreen}
            </strong>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#14221C] p-1 rounded-xl border border-[#D7E0DC] dark:border-[#21352C] text-xs">
            <span className="text-[11px] font-semibold text-[#6E7974] dark:text-[#9DB3A8] px-1.5 flex items-center gap-1">
              <Smartphone size={13} />
              Target:
            </span>
            {(['390', '412', '440', 'full'] as const).map((w) => (
              <button
                key={w}
                onClick={() => setDeviceWidth(w)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  deviceWidth === w
                    ? 'bg-[#E9F7F1] dark:bg-[#1A3328] text-[#008F5B] dark:text-[#10E594] font-bold'
                    : 'text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#17211D] dark:hover:text-white'
                }`}
              >
                {w === 'full' ? 'Auto' : `${w}dp`}
              </button>
            ))}

            <button
              onClick={() => setForceFullScreen(true)}
              className="ml-1 p-1 rounded-md text-[#6E7974] dark:text-[#9DB3A8] hover:text-[#008F5B] dark:hover:text-[#10E594] transition-colors"
              title="Full Screen View"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Android Device Mockup Frame */}
      <div
        id="android-phone-frame"
        className={`w-full ${getContainerWidth()} bg-white dark:bg-[#14221C] rounded-[32px] sm:rounded-[38px] border-[5px] sm:border-[7px] border-[#17211D] dark:border-[#0B1410] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-200 flex flex-col relative`}
      >
        {/* Android Status Bar */}
        <div
          id="android-status-bar"
          className="w-full bg-[#F5FAF7] dark:bg-[#101A16] px-6 pt-2.5 pb-1 flex items-center justify-between text-[#17211D] dark:text-[#F1F7F4] select-none text-[12px] font-semibold tracking-tight shrink-0 z-20 border-b border-[#E4ECE8]/40 dark:border-[#21352C]/40"
        >
          <span>9:41</span>
          <div className="w-4 h-4 rounded-full bg-[#17211D]/15 dark:bg-white/10 mx-auto -mr-2" />
          <div className="flex items-center gap-2 text-[#17211D] dark:text-[#F1F7F4]">
            <Signal size={13} />
            <Wifi size={13} />
            <BatteryMedium size={15} />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="w-full bg-[#F5FAF7] dark:bg-[#0E1814] min-h-[640px] max-h-[76vh] overflow-y-auto flex-1 relative flex flex-col justify-between">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        <div className="w-full bg-white dark:bg-[#14221C] py-2 flex justify-center items-center select-none border-t border-[#E4ECE8]/50 dark:border-[#21352C]/50 shrink-0">
          <div className="w-28 h-1 bg-[#17211D]/30 dark:bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};
