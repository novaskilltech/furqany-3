import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AyatOfTheDayProps {
  onListen?: () => void;
  loading?: boolean;
}

export const AyatOfTheDay: React.FC<AyatOfTheDayProps> = ({ onListen, loading }) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#5C4033] p-1 shadow-premium group">
      {/* Texture de fond dorée subtile */}
      <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/gold-scale.png')]"></div>
      
      {/* Effet de lueur dorée */}
      <div className="absolute -left-20 top-1/2 w-48 h-48 bg-premium-secondary/30 rounded-full blur-[80px] pointer-events-none group-hover:left-20 transition-all duration-1000"></div>

      <div className="relative bg-[#5C4033] border border-white/10 rounded-[2.3rem] p-8 flex flex-col items-center gap-6">
        <div className="space-y-1 text-center">
            <h4 className="text-[10px] font-black tracking-[0.3em] text-premium-secondary/80 uppercase">
                {t('ayat_of_the_day', 'Ayat of the Day')}
            </h4>
        </div>
        
        {/* Calligraphie Arabe */}
        <div className="py-2 px-4 bg-white/5 rounded-3xl border border-white/5 shadow-inner backdrop-blur-sm group-hover:scale-105 transition-all duration-500">
          <p className="text-3xl sm:text-4xl text-white font-quran text-center leading-relaxed drop-shadow-lg">
            فَاذْكُرُونِي أَذْكُرْكُمْ
          </p>
        </div>

        {/* Traduction */}
        <p className="text-center text-white/80 italic text-sm max-w-[280px] font-medium leading-relaxed">
           "{t('ayat_translation', 'So remember Me; I will remember you.')}"
        </p>

        {/* Bouton Listen & Learn */}
        <button 
           onClick={onListen}
           disabled={loading}
           className="mt-2 group/btn relative flex items-center gap-3 bg-premium-secondary hover:bg-premium-secondary/90 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-premium-secondary/40 transition-all duration-300 hover:scale-[1.05] active:scale-95 disabled:opacity-50"
        >
          {loading ? (
             <span className="animate-spin">⏳</span>
          ) : (
             <span className="text-lg">🔊</span>
          )}
          <span>{loading ? t('loading', 'Loading...') : t('listen_learn', 'Listen & Learn')}</span>
          
          {/* Subtle reflection on hover */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
        </button>
      </div>
    </div>
  );
};
