
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTheme } from '../types';

interface ThemePickerProps {
  currentTheme: AppTheme;
  isPremium: boolean;
  onSelect: (theme: AppTheme) => void;
  onClose: () => void;
}

const themes: { id: AppTheme; color: string; bg: string }[] = [
  { id: 'rose', color: 'bg-rose-500', bg: 'bg-rose-50' },
  { id: 'emerald', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
  { id: 'amber', color: 'bg-amber-500', bg: 'bg-amber-50' },
  { id: 'sky', color: 'bg-sky-500', bg: 'bg-sky-50' },
  { id: 'indigo', color: 'bg-indigo-600', bg: 'bg-indigo-50' },
  { id: 'violet', color: 'bg-violet-600', bg: 'bg-violet-50' },
];

export const ThemePicker: React.FC<ThemePickerProps> = ({ currentTheme, isPremium, onSelect, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 border-8 border-white animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">🎨</div>
          <h3 className="text-2xl font-black text-slate-800">{t('select_theme')}</h3>
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
                className={`group relative p-4 rounded-[2rem] transition-all active:scale-95 border-4 ${
                  isActive 
                    ? 'border-rose-400 bg-rose-50 shadow-md' 
                    : isLocked
                      ? 'border-gray-100 bg-gray-50 opacity-60 grayscale cursor-not-allowed'
                      : 'border-transparent bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`w-12 h-12 ${isLocked ? 'bg-gray-300' : theme.color} rounded-2xl mx-auto mb-3 shadow-sm group-hover:rotate-6 transition-transform flex items-center justify-center`}>
                  {isLocked && <span className="text-xl">🔒</span>}
                </div>
                <p className={`text-sm font-black ${isActive ? 'text-rose-600' : 'text-slate-500'}`}>
                  {t(`themes.${theme.id}`)}
                </p>
                {isActive && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm pb-0.5">
                    ✓
                  </div>
                )}
                {isLocked && (
                  <div className="absolute -top-1 -right-1 bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase shadow-sm">
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
