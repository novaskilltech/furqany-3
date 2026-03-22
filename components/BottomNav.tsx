import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppMode, AppTheme } from '../types';

interface BottomNavProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  theme: AppTheme;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentMode, onModeChange, theme }) => {
  const { t } = useTranslation();
  
  const navItems = [
    { mode: AppMode.SELECTION, icon: '📖', label: t('nav_quran', 'Coran') },
    { mode: AppMode.ADHKARS, icon: '🌅', label: t('nav_adhkars', 'Adhkars') },
    { mode: AppMode.GAMES, icon: '🎮', label: t('nav_games', 'Jeux') }
  ];

  const isActive = (itemMode: AppMode) => {
    // If we are in LEARNING mode, consider SELECTION as active in the nav
    if (itemMode === AppMode.SELECTION && currentMode === AppMode.LEARNING) {
      return true;
    }
    return currentMode === itemMode;
  };

  const isVisible = [AppMode.SELECTION, AppMode.ADHKARS, AppMode.GAMES, AppMode.BADGES, AppMode.COMPLETED_LIST].includes(currentMode);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-white/50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
      <div className="flex justify-around items-center px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.mode);
          return (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`flex flex-col items-center justify-center w-20 h-14 rounded-2xl transition-all duration-300 ${
                active 
                  ? 'bg-gradient-to-br from-indigo-50 to-rose-50 border border-white/60 shadow-sm scale-105' 
                  : 'text-gray-400 hover:text-gray-600 active:scale-95'
              }`}
            >
              <span className={`text-2xl mb-0.5 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-sm' : 'opacity-70 grayscale'}`}>{item.icon}</span>
              <span className={`text-[10px] font-bold ${active ? (theme === 'rose' ? 'text-rose-600' : 'text-indigo-600') : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
