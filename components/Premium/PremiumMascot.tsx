import React from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumMascotProps {
  message?: string;
  onPlayAudio?: () => void;
  loading?: boolean;
}

export const PremiumMascot: React.FC<PremiumMascotProps> = ({ 
  message, 
  onPlayAudio, 
  loading 
}) => {
  const { t } = useTranslation();
  
  const defaultMessage = t('lumi_dashboard_welcome', "Tu fais un travail formidable ! Savais-tu que chaque lettre du Coran est une récompense ? ✨");

  return (
    <div className="relative bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/50 shadow-premium overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-premium-secondary/10 rounded-full blur-3xl group-hover:bg-premium-secondary/20 transition-all duration-700"></div>
      
      <div className="flex items-center gap-6 relative z-10">
        {/* Lumi Mascot Icon */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500 animate-pulse-slow">
            <span className="text-4xl drop-shadow-md">🌟</span>
          </div>
          <div className="absolute -top-1 -right-1 bg-premium-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            LUMI
          </div>
        </div>

        {/* Message Bubble */}
        <div className="flex-1 space-y-2">
          <div className="relative bg-white/60 p-4 rounded-2xl rounded-tl-none border border-white/80 shadow-sm transition-all duration-300">
            <p className="text-premium-on-surface font-medium text-sm leading-relaxed italic">
              "{message || defaultMessage}"
            </p>
          </div>
          
          <button 
            onClick={onPlayAudio}
            disabled={loading}
            className="flex items-center gap-2 text-premium-secondary hover:text-premium-primary transition-colors disabled:opacity-50"
          >
            <div className={`w-8 h-8 rounded-full bg-premium-secondary/10 flex items-center justify-center ${loading ? 'animate-spin' : ''}`}>
              {loading ? (
                <span className="text-xs">⏳</span>
              ) : (
                <span className="text-xs">🔊</span>
              )}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">{t('listen_to_lumi', 'Écouter Lumi')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
