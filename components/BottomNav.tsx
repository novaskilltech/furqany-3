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
    { mode: AppMode.SELECTION, icon: 'home', label: t('nav_home', 'Accueil') },
    { mode: AppMode.ADHKARS, icon: 'auto_awesome', label: t('nav_adhkars', 'Invocations') },
    { mode: AppMode.BADGES, icon: 'emoji_events', label: t('nav_journey', 'Mon Parcours'), fill: true },
    { mode: AppMode.GAMES, icon: 'videogame_asset', label: t('nav_games', 'Jeux') }
  ];

  const isActive = (itemMode: AppMode) => {
    if (itemMode === AppMode.SELECTION && currentMode === AppMode.LEARNING) return true;
    return currentMode === itemMode;
  };

  const isVisible = [
    AppMode.SELECTION, 
    AppMode.ADHKARS, 
    AppMode.GAMES, 
    AppMode.BADGES, 
    AppMode.COMPLETED_LIST
  ].includes(currentMode);

  if (!isVisible) return null;

  return (
    <nav className="fixed bottom-0 w-full rounded-t-[3rem] z-50 bg-[#ffffff] dark:bg-[#1a1c1b] shadow-[0_-8px_32px_rgba(45,52,50,0.06)] h-24 px-4 pb-safe flex justify-around items-center">
      {navItems.map((item) => {
        const active = isActive(item.mode);
        return (
          <button
            key={item.mode}
            onClick={() => onModeChange(item.mode)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              active 
                ? 'bg-[#b1f0ce] dark:bg-[#2D6A4F] text-[#2D6A4F] dark:text-[#f8faf8] rounded-full px-5 py-2 scale-110 shadow-md transform active:scale-95' 
                : 'text-[#5755A9] dark:text-[#a6a4d9] opacity-70 hover:bg-[#e2dfff] dark:hover:bg-[#4a479b]/20 p-2 rounded-full cursor-pointer'
            }`}
          >
            <span 
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[11px] font-semibold mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
