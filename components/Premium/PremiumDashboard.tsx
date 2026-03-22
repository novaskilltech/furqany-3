import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProgress, Surah } from '../../types';
import { PremiumHeader } from './PremiumHeader';
import { PremiumGreeting } from './PremiumGreeting';
import { PremiumMascot } from './PremiumMascot';
import { DailyGlow } from './DailyGlow';
import { PremiumJourney } from './PremiumJourney';
import { PremiumPrayerTimes } from './PremiumPrayerTimes';
import { AyatOfTheDay } from './AyatOfTheDay';
import { PremiumNav } from './PremiumNav';

interface PremiumDashboardProps {
  user: any;
  progress: UserProgress;
  isPremium: boolean;
  onAction: (action: string, data?: any) => void;
}

export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({ 
  user, 
  progress, 
  isPremium,
  onAction 
}) => {
  const { t } = useTranslation();

  return (
    <div className="premium-mode min-h-screen pb-40 animate-in fade-in duration-700">
      <PremiumHeader user={user} onMenuClick={() => onAction('openMenu')} />
      
      <main className="px-6 space-y-8">
        {/* 1. Salutation */}
        <PremiumGreeting userName={progress.userName || 'Champion'} />
        
        {/* 2. Guidance & Mascotte (Lumi) */}
        <PremiumMascot 
          onPlayAudio={() => onAction('playLumiAudio')} 
          loading={false}
        />

        {/* 3. Gamification (Daily Glow) */}
        <DailyGlow streak={progress.streak || 0} />

        {/* 4. Parcours Coranique */}
        <section className="space-y-4">
            <h3 className="text-xl font-black text-premium-on-surface tracking-tight">
                {t('your_quranic_journey', 'Your Quranic Journey')}
            </h3>
            <PremiumJourney progress={progress} onSelectQuarter={(q) => onAction('selectQuarter', q)} />
        </section>

        {/* 5. Horaires de Prière */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-premium-on-surface tracking-tight">
              {t('daily_prayers', 'Daily Prayers')}
            </h3>
            <span className="text-[10px] font-black text-premium-secondary uppercase tracking-[0.2em] bg-white/60 px-3 py-1.5 rounded-xl border border-white/80">
              {t('current_location', 'PARIS, FR')}
            </span>
          </div>
          <PremiumPrayerTimes />
        </section>

        {/* 6. Verset du Jour */}
        <AyatOfTheDay onListen={() => onAction('playAyatAudio')} />

      </main>

      {/* 7. Navigation Premium */}
      <PremiumNav activeTab="home" onTabChange={(tab) => onAction('changeTab', tab)} />
    </div>
  );
};
