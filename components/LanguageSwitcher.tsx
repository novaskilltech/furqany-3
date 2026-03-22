import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  const currentLanguage = i18nInstance.language;

  const languages = [
    { code: 'fr', label: '🇫🇷 FR' },
    { code: 'ar', label: '🇸🇦 AR' },
    { code: 'en', label: '🇬🇧 EN' }
  ];

  const changeLanguage = (lng: string) => {
    i18nInstance.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            currentLanguage === lang.code
              ? 'bg-rose-500 text-white shadow-md scale-105'
              : 'bg-white/80 text-rose-700 hover:bg-rose-100'
          } border border-rose-200/50 backdrop-blur-sm`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
