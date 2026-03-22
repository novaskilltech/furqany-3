import React from 'react';
import { useTranslation } from 'react-i18next';
import { Surah, Verse, AppTheme, Reciter } from '../../types';
import { VerseDisplay } from '../VerseDisplay';
import { Mascot } from '../Mascot';

interface PremiumLearningProps {
  surah: Surah;
  currentVerseIndex: number;
  theme: AppTheme;
  reciter: Reciter;
  fontSize: number;
  isAutoPlay: boolean;
  showTafsir: boolean;
  userName?: string;
  isPremium: boolean;
  onBack: () => void;
  onToggleAutoPlay: () => void;
  onPrevVerse: () => void;
  onNextVerse: () => void;
  onToggleTafsir: () => void;
  onValidateVerse: () => void;
  onVerseEnded: () => void;
}

export const PremiumLearning: React.FC<PremiumLearningProps> = ({
  surah,
  currentVerseIndex,
  theme,
  reciter,
  fontSize,
  isAutoPlay,
  showTafsir,
  userName,
  isPremium,
  onBack,
  onToggleAutoPlay,
  onPrevVerse,
  onNextVerse,
  onToggleTafsir,
  onValidateVerse,
  onVerseEnded
}) => {
  const { t, i18n } = useTranslation();

  const getSurahTitle = (surah: Surah) => {
    const lng = i18n.language.toLowerCase();
    if (lng.startsWith('ar')) return surah.arabicName;
    if (lng.startsWith('en')) return surah.englishName || surah.name;
    return surah.frenchName || surah.name;
  };

  const isLastVerse = currentVerseIndex === surah.verses.length - 1;

  return (
    <div className="max-w-md mx-auto space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Learning Header */}
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={onBack} 
          className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary shadow-sm border border-surface-variant/30 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <div className="flex-1 text-center">
          <h3 className="text-2xl font-black text-on-surface tracking-tight">{getSurahTitle(surah)}</h3>
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{surah.name}</p>
        </div>

        <button 
          onClick={onToggleAutoPlay} 
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm border ${
            isAutoPlay 
              ? 'bg-primary text-on-primary border-primary' 
              : 'bg-surface-container-low text-on-surface/40 border-surface-variant/30'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isAutoPlay ? 1 : 0}` }}>
            {isAutoPlay ? 'stop' : 'play_arrow'}
          </span>
        </button>
      </div>

      {/* Verse Player Component */}
      <VerseDisplay 
        verse={surah.verses[currentVerseIndex]} 
        surahIdString={surah.idString}
        theme={theme}
        reciter={reciter}
        fontSizeScale={fontSize}
        onValidate={onValidateVerse}
        isAutoPlay={isAutoPlay}
        onVerseEnded={onVerseEnded}
      />

      {/* Navigation Controls */}
      <div className="flex gap-4 items-center">
        <button 
          onClick={onPrevVerse} 
          disabled={currentVerseIndex === 0} 
          className="flex-1 h-16 bg-surface-container-low rounded-3xl font-black text-on-surface shadow-sm border border-surface-variant/30 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">chevron_left</span>
          Précédent
        </button>

        <button 
          onClick={onToggleTafsir} 
          className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-lg border-2 ${
            showTafsir 
              ? 'bg-tertiary-container text-on-tertiary-container border-tertiary shadow-tertiary/20' 
              : 'bg-surface-container-high text-on-surface/40 border-surface-variant shadow-sm'
          }`}
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' ${showTafsir ? 1 : 0}` }}>
            auto_awesome
          </span>
        </button>

        <button 
          onClick={onNextVerse} 
          className={`flex-1 h-16 rounded-3xl font-black text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isLastVerse ? 'bg-secondary shadow-secondary/30' : 'bg-primary shadow-primary/30'
          }`}
        >
          {isLastVerse ? 'Finir !' : 'Suivant'}
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      {/* Mascot / Tafsir section */}
      {showTafsir && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <Mascot 
            verse={surah.verses[currentVerseIndex]} 
            surahName={getSurahTitle(surah)} 
            theme={theme} 
            userName={userName} 
            isPremium={isPremium} 
          />
        </div>
      )}
    </div>
  );
};
