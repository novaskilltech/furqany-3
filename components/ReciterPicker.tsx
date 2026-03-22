
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reciter } from '../types';

interface ReciterPickerProps {
  currentReciter: Reciter;
  isPremium: boolean;
  onSelect: (reciter: Reciter) => void;
  onClose: () => void;
}

const reciters: { id: Reciter; emoji: string }[] = [
  { id: 'hossary', emoji: '🎙️' },
  { id: 'albanna', emoji: '📖' },
];

export const ReciterPicker: React.FC<ReciterPickerProps> = ({ currentReciter, isPremium, onSelect, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 border-8 border-white animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">🎙️</div>
          <h3 className="text-2xl font-black text-slate-800">{t('select_reciter')}</h3>
        </div>

        <div className="flex flex-col gap-3">
          {reciters.map((reciter) => {
            const isLocked = !isPremium && reciter.id === 'hossary';
            const isActive = currentReciter === reciter.id;

            return (
              <button
                key={reciter.id}
                disabled={isLocked}
                onClick={() => onSelect(reciter.id)}
                className={`group relative flex items-center gap-4 p-5 rounded-[2rem] transition-all active:scale-[0.98] border-4 ${
                  isActive 
                    ? 'border-blue-400 bg-blue-50 shadow-md' 
                    : isLocked 
                      ? 'border-gray-100 bg-gray-50 opacity-60 grayscale cursor-not-allowed'
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">
                  {isLocked ? '🔒' : reciter.emoji}
                </div>
                <div className="text-left">
                  <p className={`text-lg font-black ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                    {t(`reciters.${reciter.id}`)}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {isLocked ? t('premium.title') : (reciter.id === 'hossary' ? 'Murattal' : 'Mujawwad')}
                  </p>
                </div>
                {isActive && (
                  <div className="ml-auto bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm pb-0.5">
                    ✓
                  </div>
                )}
                {isLocked && (
                  <div className="ml-auto bg-amber-100 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm">
                    Premium
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors"
        >
          {t('menu.home')}
        </button>
      </div>
    </div>
  );
};
