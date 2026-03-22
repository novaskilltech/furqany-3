import React from 'react';
import { UserProgress } from '../../types';
import { SHORT_SURAHS } from '../../constants';

interface PremiumJourneyProps {
  progress: UserProgress;
  onSelectSurah: (surah: any) => void;
}

export const PremiumJourney: React.FC<PremiumJourneyProps> = ({ progress, onSelectSurah }) => {
  const quarters = [
    { id: 1, range: [1, 6], name: '1er Trimestre', category: 'Fondations' },
    { id: 2, range: [7, 17], name: '2ème Trimestre', category: 'Progression' },
    { id: 3, range: [18, 35], name: '3ème Trimestre', category: 'Avancé' },
    { id: 4, range: [36, 114], name: '4ème Trimestre', category: 'Maîtrise' },
  ];

  return (
    <div className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x px-2">
      {quarters.map((q) => {
        const quarterSurahs = SHORT_SURAHS.filter(s => s.id >= q.range[0] && s.id <= q.range[1]);
        const completedCount = quarterSurahs.filter(s => progress.completedSurahs.includes(s.id)).length;
        const totalCount = quarterSurahs.length;
        const percentage = Math.round((completedCount / totalCount) * 100);
        
        return (
          <div key={q.id} className="min-w-[300px] bg-surface-container-low rounded-[2.5rem] p-8 snap-center border border-surface-variant/30 flex flex-col gap-8 shadow-sm hover:shadow-md transition-shadow">
            {/* Quarter Header with Circular Progress */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-secondary font-bold text-xs uppercase tracking-widest">{q.category}</span>
                <h4 className="text-2xl font-black text-on-surface mt-1">{q.name}</h4>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-surface-variant opacity-20" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - percentage / 100)} className="text-primary transition-all duration-1000" strokeLinecap="round" />
                </svg>
                <span className="absolute text-xs font-black text-on-surface">{percentage}%</span>
              </div>
            </div>

            {/* Surah Grid */}
            <div className="grid grid-cols-2 gap-3">
              {quarterSurahs.map((surah) => {
                const isCompleted = progress.completedSurahs.includes(surah.id);
                return (
                  <button 
                    key={surah.id}
                    onClick={() => onSelectSurah(surah)}
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95 ${
                      isCompleted 
                        ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                        : 'bg-surface-container-high text-on-surface/40 grayscale hover:grayscale-0'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' ${isCompleted ? 1 : 0}` }}>
                      {isCompleted ? 'check_circle' : 'menu_book'}
                    </span>
                    <span className="text-[12px] font-bold truncate">{surah.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Reward Teaser */}
            <div className="mt-auto bg-tertiary-container/10 rounded-2xl p-4 flex items-center gap-4 border border-tertiary-container/20">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">emoji_events</span>
              </div>
              <p className="text-[11px] font-bold text-on-tertiary-container leading-tight">
                Un badge spécial vous attend à la fin de ce trimestre !
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
