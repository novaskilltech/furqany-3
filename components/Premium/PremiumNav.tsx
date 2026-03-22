import React from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PremiumNav: React.FC<PremiumNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', icon: '🏠', label: t('nav_home', 'Accueil') },
    { id: 'learn', icon: '📖', label: t('nav_learn', 'Apprendre') },
    { id: 'dhikr', icon: '📿', label: t('nav_dhikr', 'Invocations') },
    { id: 'stats', icon: '📊', label: t('nav_stats', 'Progrès') },
  ];

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-premium-surface-high/90 backdrop-blur-xl rounded-[24px] p-2 flex items-center justify-around shadow-premium-2xl z-50 border border-white/20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${
            activeTab === tab.id 
              ? 'bg-premium-primary text-white scale-105 shadow-lg' 
              : 'text-premium-on-surface/40 hover:text-premium-on-surface/70'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
