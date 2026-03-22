import React from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PremiumNav: React.FC<PremiumNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', icon: 'home', label: t('nav_home', 'Accueil') },
    { id: 'learn', icon: 'auto_stories', label: t('nav_learn', 'Apprendre') },
    { id: 'dhikr', icon: 'auto_awesome', label: t('nav_dhikr', 'Invocations') },
    { id: 'stats', icon: 'leaderboard', label: t('nav_stats', 'Progrès') },
  ];

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-surface-container-low/95 backdrop-blur-2xl rounded-pill p-2 flex items-center justify-around shadow-premium z-50 border border-surface-variant/30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 py-3 px-6 rounded-pill transition-all duration-500 relative group ${
              isActive 
                ? 'bg-primary text-on-primary scale-110 shadow-lg' 
                : 'text-on-surface/40 hover:text-on-surface/70'
            }`}
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}` }}>
              {tab.icon}
            </span>
            {isActive && <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>}
            
            {!isActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
};
