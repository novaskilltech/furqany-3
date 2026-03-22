import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reciter } from '../types';

interface ReciterPickerProps {
  currentReciter: Reciter;
  isPremium: boolean;
  onSelect: (reciter: Reciter) => void;
  onClose: () => void;
}

const reciters: { id: Reciter; icon: string; style: string }[] = [
  { id: 'hossary', icon: 'interpreter_mode', style: 'Murattal' },
  { id: 'albanna', icon: 'record_voice_over', style: 'Mujawwad' },
];

export const ReciterPicker: React.FC<ReciterPickerProps> = ({ currentReciter, isPremium, onSelect, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-500">
      <div className="bg-surface-container-low w-full max-w-sm rounded-[3.5rem] shadow-2xl p-8 border border-surface-variant/30 animate-in zoom-in duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary animate-pulse"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto text-secondary mb-4">
            <span className="material-symbols-outlined text-3xl">mic</span>
          </div>
          <h3 className="text-2xl font-black text-on-surface tracking-tight">{t('select_reciter')}</h3>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-1">Vois de Récitation</p>
        </div>

        <div className="flex flex-col gap-4">
          {reciters.map((reciter) => {
            const isLocked = !isPremium && reciter.id === 'hossary';
            const isActive = currentReciter === reciter.id;

            return (
              <button
                key={reciter.id}
                disabled={isLocked}
                onClick={() => onSelect(reciter.id)}
                className={`group relative flex items-center gap-5 p-6 rounded-[2.5rem] transition-all active:scale-[0.98] border-2 ${
                  isActive 
                    ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10' 
                    : isLocked 
                      ? 'border-surface-variant/10 bg-surface-container-high/40 opacity-60 grayscale cursor-not-allowed'
                      : 'border-surface-variant/20 bg-surface-container hover:border-surface-variant/40 hover:bg-surface-container-high'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isActive ? 'bg-secondary text-on-secondary shadow-lg scale-110' : 'bg-surface-container-high text-secondary group-hover:bg-secondary/20'
                }`}>
                  <span className="material-symbols-outlined text-2xl">
                    {isLocked ? 'lock' : reciter.icon}
                  </span>
                </div>
                
                <div className="text-left flex-1">
                  <p className={`text-lg font-black tracking-tight ${isActive ? 'text-secondary' : 'text-on-surface'}`}>
                    {t(`reciters.${reciter.id}`)}
                  </p>
                  <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">
                    {isLocked ? t('premium.title') : reciter.style}
                  </p>
                </div>

                {isActive && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: `'FILL' 1` }}>check_circle</span>
                  </div>
                )}
                
                {isLocked && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                     Premium
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
