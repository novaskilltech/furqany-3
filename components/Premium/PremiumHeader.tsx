import React from 'react';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface PremiumHeaderProps {
  user: any;
  onMenuClick: () => void;
  onAction: (action: string, data?: any) => void;
}

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({ user, onMenuClick, onAction }) => {
  return (
    <header className="flex items-center justify-between px-6 py-6 sticky top-0 z-50 bg-white/40 backdrop-blur-xl border-b border-white/20">
      <button 
        onClick={() => onAction('renameUser')}
        className="w-12 h-12 rounded-full p-1 bg-gradient-to-tr from-[#F59E0B] to-[#FDE68A] shadow-md flex items-center justify-center transform hover:rotate-6 transition-transform hover:scale-105 active:scale-95"
      >
        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center text-premium-primary font-black border border-white/50">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl">{user?.displayName?.[0] || 'A'}</span>
          )}
        </div>
      </button>

      <div className="flex flex-col flex-1 mx-3">
        <h2 className="text-xl font-black text-[#064E3B] tracking-tight leading-none mb-1">
          FURQANY
        </h2>
        <span className="text-[10px] font-black text-premium-secondary uppercase tracking-[0.2em] leading-none opacity-80">
          Digital Sanctuary
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <button 
          onClick={onMenuClick}
          className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md flex items-center justify-center text-premium-primary shadow-sm border border-white/80 hover:bg-white hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>
    </header>
  );
};
