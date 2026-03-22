import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserProgress } from '../../types';
import { BADGES_LIST } from '../../constants';

interface PremiumBadgesProps {
  progress: UserProgress;
  onBack: () => void;
}

export const PremiumBadges: React.FC<PremiumBadgesProps> = ({ progress, onBack }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Badges Header */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={onBack} 
          className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary shadow-sm border border-surface-variant/30 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="flex-1 text-center">
          <h3 className="text-2xl font-black text-on-surface tracking-tight">{t('badges_title', 'Mes Badges')}</h3>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Ta Collection</p>
        </div>
        <div className="w-12" />
      </div>

      {/* Stats Bento Card */}
      <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-sm border border-surface-variant/30 grid grid-cols-2 gap-6 relative overflow-hidden group">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Étoiles Jeux</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: `'FILL' 1` }}>star</span>
            <span className="text-3xl font-black text-on-surface">{progress.gameStars || 0}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Badges Gagnés</span>
          <div className="flex items-center gap-2 justify-end">
             <span className="text-3xl font-black text-on-surface">{progress.badges.length}</span>
             <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: `'FILL' 1` }}>workspace_premium</span>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full -z-10 group-hover:scale-125 transition-transform duration-1000"></div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 gap-4">
        {BADGES_LIST.map((badge) => {
          const isOwned = progress.badges.includes(badge.id);
          return (
            <div 
              key={badge.id} 
              className={`p-6 rounded-[2.5rem] border flex items-center gap-6 transition-all duration-500 overflow-hidden relative ${
                isOwned 
                  ? 'bg-surface-container-low border-primary/20 shadow-sm' 
                  : 'bg-surface-container-low/40 border-surface-variant/10 grayscale opacity-60'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg shrink-0 relative z-10 ${
                isOwned ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20' : 'bg-surface-variant/20 border border-surface-variant/10'
              }`}>
                {badge.emoji}
                {isOwned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary text-[10px] border-2 border-surface-container-low">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 relative z-10">
                <h4 className="text-lg font-black text-on-surface">{badge.name}</h4>
                <p className="text-[11px] font-medium text-on-surface/50 leading-relaxed mt-1">{badge.description}</p>
              </div>

              {isOwned && (
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-primary/5 -mr-16 rotate-12 -z-10 group-hover:rotate-6 transition-transform"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
