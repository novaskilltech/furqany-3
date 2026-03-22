
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

const themeStyles = {
  emerald: 'bg-emerald-600 border-emerald-200 bg-emerald-50',
  gold: 'bg-amber-500 border-amber-200 bg-amber-50',
  indigo: 'bg-indigo-600 border-indigo-200 bg-indigo-50',
  rose: 'bg-rose-500 border-rose-200 bg-rose-50',
};

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
      // Reprendre le contexte audio si suspendu (requis par les navigateurs modernes)
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

  const currentStyles = themeStyles[theme].split(' ');

  return (
    <div className={`flex flex-col items-center bg-white/90 backdrop-blur-md rounded-[2.5rem] p-6 shadow-xl border-4 ${currentStyles[1]} transition-all w-full`}>
      <div className="relative mb-4">
        <div className={`w-20 h-20 ${currentStyles[0]} rounded-full flex items-center justify-center animate-pulse shadow-inner`}>
           <span className="text-4xl">🌟</span>
        </div>
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full px-3 py-1 text-xs font-bold shadow-sm">
          Lumi
        </div>
      </div>
      
      <div className={`${currentStyles[2]} p-5 rounded-2xl relative w-full border-2 border-white/50 shadow-inner`}>
        <p className="text-gray-700 text-center font-medium text-lg leading-relaxed">
          {message}
        </p>
      </div>

      <button
        onClick={playExplanation}
        disabled={loading}
        className={`mt-4 w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all text-xl ${
          loading ? 'bg-gray-400' : `${currentStyles[0]} hover:scale-[1.02] active:scale-95`
        }`}
      >
        {loading ? t('lumi_thinking') : t('lumi_explain')}
      </button>
    </div>
  );
};
