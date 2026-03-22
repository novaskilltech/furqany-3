
import React, { useState, useRef, useEffect } from 'react';
import { Verse, AppTheme, Reciter } from '../types';
import { useTranslation } from 'react-i18next';

interface VerseDisplayProps {
  verse: Verse;
  surahIdString: string;
  theme: AppTheme;
  reciter: Reciter;
  fontSizeScale?: number;
  onValidate: () => void;
  isAutoPlay?: boolean;
  onVerseEnded?: () => void;
}

const themeColors = {
  emerald: 'border-emerald-100 bg-emerald-600',
  gold: 'border-amber-100 bg-amber-500',
  indigo: 'border-indigo-100 bg-indigo-600',
  rose: 'border-rose-100 bg-rose-500',
};

const fontSizeMap: { [key: number]: string } = {
  1: 'text-2xl',
  2: 'text-3xl',
  3: 'text-4xl',
  4: 'text-5xl',
  5: 'text-6xl',
};

export const VerseDisplay: React.FC<VerseDisplayProps> = ({ 
  verse, surahIdString, theme, reciter, fontSizeScale = 3, onValidate, isAutoPlay, onVerseEnded 
}) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const fontSizeClass = fontSizeMap[fontSizeScale] || fontSizeMap[3];
  const verseNum = verse.number.toString().padStart(3, '0');
  
  const reciterUrlMap: { [key in Reciter]: string } = {
    hossary: 'https://www.everyayah.com/data/Husary_128kbps/',
    albanna: 'https://www.everyayah.com/data/mahmoud_ali_al_banna_32kbps/'
  };
  const audioUrl = `${reciterUrlMap[reciter]}${surahIdString}${verseNum}.mp3`;

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentRepeat(1);
    
    // Auto-play when verse changes if prop is true
    if (isAutoPlay) {
      setTimeout(() => {
        if (audioRef.current) {
          setIsLoading(true);
          audioRef.current.play().catch(err => {
            console.error("Auto-play error:", err);
            setHasError(true);
            setIsLoading(false);
          });
        }
      }, 500); // Small delay for smooth transition
    }
  }, [verse, surahIdString, isAutoPlay]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setCurrentRepeat(1);
      } else {
        setHasError(false);
        setIsLoading(true);
        audioRef.current.play().catch(err => {
          console.error("Audio error:", err);
          setHasError(true);
          setIsLoading(false);
        });
      }
    }
  };

  const handleAudioEnd = () => {
    if (currentRepeat < repeatCount) {
      setCurrentRepeat(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      setIsPlaying(false);
      setCurrentRepeat(1);
      if (onVerseEnded) onVerseEnded();
    }
  };

  return (
    <div className={`w-full bg-white rounded-[2.5rem] p-6 shadow-xl border-2 ${themeColors[theme].split(' ')[0]} flex flex-col items-center gap-5`}>
      <div className="flex justify-between w-full items-center">
        <div className="flex flex-col gap-1">
          <div className={`${themeColors[theme].split(' ')[1]} text-white px-4 py-1.5 rounded-full text-sm font-black shadow-sm w-fit`}>
            {t('learning_verse')} {verse.number}
          </div>
          {isPlaying && repeatCount > 1 && (
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">
              {t('repetition')} {currentRepeat} / {repeatCount}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
            {[1, 3, 5].map(num => (
              <button
                key={num}
                onClick={() => {
                  setRepeatCount(num);
                  if (isPlaying) {
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                  }
                }}
                className={`w-10 h-10 rounded-full text-xs font-black transition-all ${
                  repeatCount === num 
                    ? themeColors[theme].split(' ')[1] + ' text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-200'
                }`}
              >
                x{num}
              </button>
            ))}
          </div>

          <button 
            onClick={toggleAudio}
            disabled={isLoading && !isPlaying}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform relative ${
              hasError ? 'bg-red-500' : (isLoading && !isPlaying ? 'bg-gray-300' : themeColors[theme].split(' ')[1])
            }`}
          >
            {isLoading && !isPlaying && (
              <div className="absolute inset-0 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            <span className="text-2xl z-10">
              {hasError ? '⚠️' : (isPlaying ? '⏸️' : '▶️')}
            </span>
          </button>
        </div>
      </div>

      <button 
        onClick={onValidate}
        className={`w-full py-4 rounded-2xl font-black text-lg shadow-md active:translate-y-0.5 transition-all ${themeColors[theme].split(' ')[1]} text-white`}
      >
        {t('learning_validate')} ✅
      </button>

      <audio 
        key={audioUrl}
        ref={audioRef}
        src={audioUrl}
        onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
        onPause={() => setIsPlaying(false)}
        onEnded={handleAudioEnd}
        onError={() => { setHasError(true); setIsLoading(false); }}
        onCanPlay={() => setIsLoading(false)}
        preload="auto"
      />
      
      <div 
        className={`quran-text ${fontSizeClass} text-gray-800 py-4 font-bold leading-normal w-full text-center px-2`} 
        style={{ wordBreak: 'keep-all', direction: 'rtl' }}
      >
        {verse.arabic}
      </div>

      <div className="w-full h-px bg-gray-50"></div>

      <div className="text-center w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <p className="text-gray-600 text-sm font-medium leading-relaxed italic">
          {verse.french}
        </p>
      </div>
    </div>
  );
};
