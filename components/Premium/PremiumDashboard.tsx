import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProgress, Surah } from '../../types';
import { PremiumHeader } from './PremiumHeader';
import { PremiumGreeting } from './PremiumGreeting';
import { PremiumPrayerTimes } from './PremiumPrayerTimes';
import { PremiumLearningCalendar } from './PremiumLearningCalendar';
import { PremiumJourney } from './PremiumJourney';
import { PremiumStories } from './PremiumStories';
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
    <div className="premium-mode min-h-screen pb-32 animate-in fade-in duration-700">
      <PremiumHeader user={user} onMenuClick={() => onAction('openMenu')} />
      
      <main className="px-6 space-y-10">
        <PremiumGreeting userName={progress.userName || 'Champion'} />
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="premium-title text-xl font-bold text-premium-on-surface">
              {t('prayer_times_title', 'Temps de prière')}
            </h3>
            <span className="text-xs font-bold text-premium-secondary uppercase tracking-widest bg-premium-surface-high px-2 py-1 rounded-lg">
              PARIS, FR
            </span>
          </div>
          <PremiumPrayerTimes />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="premium-title text-xl font-bold text-premium-on-surface">
              {t('learning_calendar_title', 'Calendrier d\'apprentissage')}
            </h3>
            <button className="text-premium-primary">
              <span className="text-xl">📅</span>
            </button>
          </div>
          <PremiumLearningCalendar />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="premium-title text-xl font-bold text-premium-on-surface">
              {t('continue_journey', 'Continuer votre voyage')}
            </h3>
          </div>
          <PremiumJourney progress={progress} onSelectQuarter={(q) => onAction('selectQuarter', q)} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="premium-title text-xl font-bold text-premium-on-surface">
              {t('prophetic_stories', 'Histoires Prophétiques')}
            </h3>
            <button className="text-premium-secondary text-xs font-bold uppercase flex items-center gap-1">
              {t('see_all', 'Voir tout')} <span className="text-lg">→</span>
            </button>
          </div>
          <PremiumStories />
        </section>
      </main>

      <PremiumNav activeTab="home" onTabChange={(tab) => onAction('changeTab', tab)} />
    </div>
  );
};
