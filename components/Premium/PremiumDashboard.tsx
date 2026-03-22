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
      <PremiumHeader user={user} onMenuClick={() => onAction('openMenu')} />
      

      <main className="px-6 space-y-8">
        {expandedQuarterId ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => onAction('selectQuarter', null)}
                        className="bg-white/80 p-3 rounded-2xl text-premium-primary font-bold shadow-sm border border-white/50 flex items-center gap-2 active:scale-95 transition-all"
                    >
                        <span>←</span> {t('back', 'Retour')}
                    </button>
                    <h3 className="text-xl font-black text-premium-on-surface tracking-tight">
                        {t(`quarters.q${expandedQuarterId}`, `Quarter ${expandedQuarterId}`)}
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 pb-20">
                    {SHORT_SURAHS.filter(s => {
                        const ranges = [[1, 6], [7, 17], [18, 35], [36, 114]];
                        const range = ranges[expandedQuarterId - 1];
                        return s.id >= range[0] && s.id <= range[1];
                    }).map(surah => (
                        <button 
                            key={surah.id}
                            onClick={() => onAction('selectSurah', surah)}
                            className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${progress.completedSurahs.includes(surah.id) ? 'bg-emerald-500/10 text-emerald-600' : 'bg-white/40 text-premium-primary/30'}`}>
                                    {surah.isSpecialVerse ? '💎' : surah.idString.replace(/^0+/, '')}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-premium-on-surface text-lg leading-tight">
                                        {getSurahTitle(surah)}
                                    </h4>
                                    <p className="text-[10px] font-black text-premium-secondary uppercase tracking-widest mt-1">
                                        {surah.name}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${progress.completedSurahs.includes(surah.id) ? 'bg-emerald-500/20 text-emerald-600' : 'bg-white/40 text-premium-primary/20'}`}>
                                 {progress.completedSurahs.includes(surah.id) ? '✅' : '📖'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        ) : (
          <>
            {/* 1. Salutation */}
            <PremiumGreeting 
              userName={progress.userName || 'Champion'} 
              onRename={() => onAction('renameUser')}
            />
            
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
          </>
        )}
      </main>

      {/* 7. Navigation Premium */}
      <PremiumNav activeTab="home" onTabChange={(tab) => onAction('changeTab', tab)} />
    </div>
  );
};
