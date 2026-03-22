import React from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumGreetingProps {
  userName: string;
  onRename?: () => void;
}

export const PremiumGreeting: React.FC<PremiumGreetingProps> = ({ userName, onRename }) => {
  const { t } = useTranslation();
  
  return (
    <div className="py-4">
      <h2 className="text-3xl font-black text-premium-on-surface leading-tight flex flex-col">
        <span className="text-sm font-black text-premium-secondary uppercase tracking-[0.3em] mb-2 opacity-80">
          {t('welcome_message', 'Assalamu Alaykum')}
        </span>
        <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
                {userName}! <span className="text-2xl animate-bounce">✨</span>
            </span>
            <button 
                onClick={onRename}
                className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-[12px] opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all border border-white/50"
                title={t('edit_name', 'Modifier mon prénom')}
            >
                ✏️
            </button>
        </div>
      </h2>
      <p className="text-premium-on-surface/70 font-medium text-lg mt-3 max-w-[300px] leading-relaxed">
        {t('premium_welcome_sub', 'Ready for your spiritual adventure today?')}
      </p>
    </div>
  );
};
