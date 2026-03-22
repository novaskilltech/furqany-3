import React, { useState, useEffect } from 'react';
import { getChildFriendlyExplanation, generateMascotAudio, decodeAudioBuffer } from '../geminiService';
import { Verse, AppTheme } from '../types';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

interface MascotProps {
  verse: Verse;
  surahName: string;
  theme: AppTheme;
  userName?: string;
  isPremium: boolean;
}

export const Mascot: React.FC<MascotProps> = ({ verse, surahName, theme, userName, isPremium }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>(userName ? t('lumi_intro', { name: userName }) : t('lumi_intro_no_name'));
  const [loading, setLoading] = useState(false);
  const [audioCtx] = useState(() => new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));

  useEffect(() => {
    setMessage(userName ? t('lumi_intro', { name: userName }) : t('lumi_intro_no_name'));
  }, [userName, t]);

  const playExplanation = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const text = await getChildFriendlyExplanation(verse, surahName, isPremium, userName, undefined, i18n.language);
      setMessage(text);
      
      const audioBase64 = await generateMascotAudio(text, isPremium);
      if (audioBase64) {
        try {
          const buffer = await decodeAudioBuffer(audioBase64, audioCtx);
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start();
        } catch (e) {
          console.error("Audio playback error", e);
        }
      }
    } catch (error) {
      console.error("Mascot interaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-container-low rounded-[2.5rem] p-8 shadow-sm border border-surface-variant/30 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-2 duration-700">
      {/* Mascot Avatar Section */}
      <div className="relative group">
        <div className="w-24 h-24 bg-tertiary-container rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-tertiary/20 border-4 border-surface-container-low relative z-10">
          <span className="material-symbols-outlined text-5xl text-on-tertiary-container select-none group-hover:rotate-12 transition-transform">star</span>
        </div>
        <div className="absolute -top-1 -right-1 bg-primary text-on-primary rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-md z-20 border-2 border-surface-container-low">
          Lumi
        </div>
        {/* Decorative Circles */}
        <div className="absolute inset-0 bg-tertiary-container/30 rounded-full scale-125 -z-10 animate-ping opacity-20"></div>
      </div>
      
      {/* Speech Bubble / Message */}
      <div className="w-full bg-surface-container-highest/30 p-6 rounded-[2rem] border border-surface-variant/20 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-surface-container-highest/30 rotate-45 border-l border-t border-surface-variant/20 -z-10"></div>
        <p className="text-on-surface text-center font-bold text-lg leading-relaxed italic">
          {message}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={playExplanation}
        disabled={loading}
        className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
          loading 
            ? 'bg-surface-variant text-on-surface/40' 
            : 'bg-tertiary text-on-tertiary shadow-tertiary/20 hover:scale-[1.02] active:scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' 1` }}>
          {loading ? 'hourglass_empty' : 'psychology'}
        </span>
        {loading ? t('lumi_thinking') : t('lumi_explain')}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>
  );
};
