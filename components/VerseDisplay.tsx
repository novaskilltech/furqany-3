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
    
    if (isAutoPlay) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          setIsLoading(true);
          audioRef.current.play().catch(err => {
            console.error("Auto-play error:", err);
            setHasError(true);
            setIsLoading(false);
          });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [verse, surahIdString, isAutoPlay]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
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
    <div className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Verse Bento Card */}
      <div className="bg-surface-container-low rounded-[3rem] p-8 shadow-sm border border-surface-variant/30 flex flex-col gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
        
        {/* Header: Verse Number & Controls */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-1">
            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-primary/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">bookmark</span>
              {t('learning_verse')} {verse.number}
            </div>
            {isPlaying && repeatCount > 1 && (
              <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1 mt-1">
                {t('repetition')} {currentRepeat} / {repeatCount}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Repetition Selector */}
            <div className="flex bg-surface-container-high p-1 rounded-pill border border-surface-variant/30">
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
                      ? 'bg-primary text-on-primary shadow-md' 
                      : 'text-on-surface/40 hover:text-on-surface/70'
                  }`}
                >
                  x{num}
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button 
              onClick={toggleAudio}
              disabled={isLoading && !isPlaying}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all relative ${
                hasError ? 'bg-error' : (isLoading && !isPlaying ? 'bg-surface-variant' : 'bg-primary shadow-primary/30')
              }`}
            >
              {isLoading && !isPlaying && (
                <div className="absolute inset-0 border-4 border-white/20 border-t-white rounded-2xl animate-spin"></div>
              )}
              <span className="material-symbols-outlined text-3xl z-10" style={{ fontVariationSettings: `'FILL' 1` }}>
                {hasError ? 'error' : (isPlaying ? 'pause' : 'play_arrow')}
              </span>
            </button>
          </div>
        </div>

        {/* Arabic Text Section */}
        <div 
          className="quran-text py-4 font-bold leading-[1.8] w-full text-center px-2 relative z-10" 
          style={{ 
            wordBreak: 'keep-all', 
            direction: 'rtl',
            fontSize: `${(fontSizeScale || 3) * 1.5}rem`
          }}
        >
          <span className="text-on-surface drop-shadow-sm select-none">
            {verse.arabic}
          </span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-surface-variant/30 relative z-10"></div>

        {/* Translation Section */}
        <div className="w-full bg-surface-container-high/50 p-6 rounded-[2rem] border border-surface-variant/20 relative z-10">
          <p className="text-on-surface/60 text-[14px] font-bold leading-relaxed italic text-center">
            {verse.french}
          </p>
        </div>
      </div>

      {/* Action Footers: Validate Button */}
      <button 
        onClick={onValidate}
        className="w-full py-5 bg-secondary rounded-[2rem] font-black text-xl text-on-secondary shadow-lg shadow-secondary/20 active:translate-y-1 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
      >
        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">check_circle</span>
        {t('learning_validate')}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
    </div>
  );
};
