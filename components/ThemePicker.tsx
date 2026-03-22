import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTheme } from '../types';

interface ThemePickerProps {
  currentTheme: AppTheme;
  isPremium: boolean;
  onSelect: (theme: AppTheme) => void;
  onClose: () => void;
}

const themes: { id: AppTheme; color: string; bg: string; dot: string }[] = [
  { id: 'rose', color: 'primary', bg: 'bg-rose-50', dot: '#e11d48' },
  { id: 'emerald', color: 'bg-emerald-500', bg: 'bg-emerald-50', dot: '#10b981' },
  { id: 'amber', color: 'bg-amber-500', bg: 'bg-amber-50', dot: '#f59e0b' },
  { id: 'sky', color: 'bg-sky-500', bg: 'bg-sky-50', dot: '#0ea5e9' },
  { id: 'indigo', color: 'bg-indigo-600', bg: 'bg-indigo-50', dot: '#4f46e5' },
  { id: 'violet', color: 'bg-violet-600', bg: 'bg-violet-50', dot: '#7c3aed' },
];

export const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, isPremium, onSelect, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="bg-surface-container-low w-full max-w-sm rounded-[3.5rem] shadow-2xl p-8 border border-surface-variant/30 animate-in zoom-in duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">palette</span>
          </div>
          <h3 className="text-2xl font-black text-on-surface tracking-tight">{t('select_theme')}</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Personnalisation</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {themes.map((theme) => {
            const isLocked = !isPremium && theme.id !== 'rose';
            const isActive = currentTheme === theme.id;

            return (
              <button
                key={theme.id}
                disabled={isLocked}
                onClick={() => onSelect(theme.id)}
                className={`group relative p-5 rounded-[2.5rem] transition-all active:scale-95 border-2 flex flex-col items-center gap-3 ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                    : isLocked
                      ? 'border-surface-variant/10 bg-surface-container-high/40 opacity-60 grayscale cursor-not-allowed'
                      : 'border-surface-variant/20 bg-surface-container hover:border-surface-variant/40 hover:bg-surface-container-high'
                }`}
              >
                <div 
                  className={`w-14 h-14 rounded-2xl shadow-inner relative flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}
                  style={{ backgroundColor: isLocked ? '#94a3b8' : theme.dot }}
                >
                  <div className="absolute inset-0 bg-white/20 rounded-2xl border border-white/30 backdrop-blur-[2px]"></div>
                  {isLocked && (
                    <span className="material-symbols-outlined text-white relative z-10 text-xl" style={{ fontVariationSettings: `'FILL' 1` }}>lock</span>
                  )}
                  {isActive && !isLocked && (
                    <span className="material-symbols-outlined text-white relative z-10 text-2xl" style={{ fontVariationSettings: `'FILL' 1` }}>check_circle</span>
                  )}
                </div>
                
                <div className="text-center">
                  <p className={`text-[13px] font-black ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {t(`themes.${theme.id}`)}
                  </p>
                  {isLocked && (
                    <div className="mt-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">
                      Premium
                    </div>
                  )}
                </div>

                {/* Micro-sparkle on active */}
                {isActive && (
                   <div className="absolute -top-1 -right-1 flex">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                   </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-10 py-5 bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 border border-surface-variant/20"
        >
          {t('menu.home')}
        </button>
      </div>
    </div>
  );
};
