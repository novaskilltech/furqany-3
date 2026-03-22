import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProgress, Surah } from '../../types';
import { PremiumHeader } from './PremiumHeader';

import { PremiumStories } from './PremiumStories';
import { PremiumJourney } from './PremiumJourney';
import { PremiumPrayerTimes } from './PremiumPrayerTimes';
import { PremiumNav } from './PremiumNav';
import { SHORT_SURAHS } from '../../constants';

interface PremiumDashboardProps {
  user: any;
  progress: UserProgress;
  isPremium: boolean;
  expandedQuarterId: number | null;
  onAction: (action: string, data?: any) => void;
}

export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ 
  user, 
  progress, 
  isPremium,
  expandedQuarterId,
  onAction 
}) => {
  const { t, i18n } = useTranslation();

  const getSurahTitle = (surah: any) => {
    const lng = i18n.language.toLowerCase();
    if (lng.startsWith('ar')) return surah.arabicName;
    if (lng.startsWith('en')) return surah.englishName || surah.name;
    return surah.frenchName || surah.name;
  };

  return (
    <div className="premium-mode min-h-screen pb-40 animate-in fade-in duration-700">
      <PremiumHeader user={user} onMenuClick={() => onAction('openMenu')} onAction={onAction} />
      

      <main className="px-6 space-y-8">
        {/* 1. Histoires Inspirantes */}
        <section className="space-y-4">
            <h3 className="text-xl font-black text-on-surface tracking-tight">
                Histoires Inspirantes
            </h3>
            <PremiumStories />
        </section>

        {/* 2. Parcours Coranique */}
        <section className="space-y-4">
            <h3 className="text-xl font-black text-on-surface tracking-tight">
                {t('your_quranic_journey', 'Mon Parcours Coranique')}
            </h3>
            <PremiumJourney progress={progress} onSelectSurah={(surah) => onAction('selectSurah', surah)} />
        </section>

        {/* 5. Horaires de Prière */}
        <section className="space-y-4 pb-20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-on-surface tracking-tight">
              {t('daily_prayers', 'Horaires de Prière')}
            </h3>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] bg-surface-container-high px-3 py-1.5 rounded-xl border border-surface-variant/30">
              {t('current_location', 'PARIS, FR')}
            </span>
          </div>
          <PremiumPrayerTimes />
        </section>
      </main>

      {/* 7. Navigation Premium */}
      <PremiumNav activeTab="home" onTabChange={(tab) => onAction('changeTab', tab)} />
    </div>
  );
};
