import React from 'react';

interface PremiumHeaderProps {
  user: any;
  onMenuClick: () => void;
  onAction: (action: string, data?: any) => void;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ user, onMenuClick, onAction }) => {
  return (
    <header className="px-6 pt-12 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      {/* Top Bar: Profile & Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-primary to-secondary shadow-lg rotate-3">
            <div className="w-full h-full rounded-full bg-surface-container-lowest overflow-hidden flex items-center justify-center border-2 border-surface-container-lowest">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary">
                  {user?.displayName?.[0] || 'A'}
                </span>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">Salam, {user?.displayName || 'Ami'}</h2>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">Digital Sanctuary</p>
          </div>
        </div>

        <button 
          onClick={onMenuClick}
          className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary shadow-sm border border-surface-variant/30 hover:bg-surface-container-high transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* Daily Message Card */}
      <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <span className="text-xs font-black text-primary uppercase tracking-widest">Message du Jour</span>
          </div>
          <p className="text-xl font-bold text-on-surface leading-snug">
            "Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne."
          </p>
          <div className="flex items-center gap-2 mt-2 opacity-60">
            <div className="w-8 h-[2px] bg-primary"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest italic">Hadith</span>
          </div>
        </div>
      </div>
    </header>
  );
};
