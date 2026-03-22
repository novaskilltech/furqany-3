import React from 'react';

interface PremiumHeaderProps {
  user: any;
  onMenuClick: () => void;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ user, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-premium-secondary/10 flex items-center justify-center text-premium-secondary font-bold border border-premium-secondary/20">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{user?.displayName?.[0] || 'A'}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-premium-secondary uppercase tracking-widest leading-none mb-1">
            Mode Premium
          </span>
          <span className="text-sm font-bold text-premium-on-surface leading-none">
            Furqany Explorer
          </span>
        </div>
      </div>
      <button 
        onClick={onMenuClick}
        className="w-10 h-10 rounded-full bg-premium-surface-high flex items-center justify-center text-premium-on-surface shadow-sm hover:bg-premium-surface-medium transition-colors"
      >
        <span className="text-xl">☰</span>
      </button>
    </header>
  );
};
