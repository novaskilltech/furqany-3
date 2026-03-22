import React from 'react';
import { useTranslation } from 'react-i18next';

interface PremiumGreetingProps {
  userName: string;
}

export const PremiumGreeting: React.FC<PremiumGreetingProps> = ({ userName }) => {
  const { t } = useTranslation();
  
  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greetingKey = hour < 18 ? 'good_morning' : 'good_evening';
  const defaultGreeting = hour < 18 ? 'Bonjour' : 'Bonsoir';

  return (
    <div className="py-2">
      <h2 className="premium-title text-3xl font-bold text-premium-on-surface flex flex-col gap-1">
        <span className="text-premium-secondary text-sm font-medium uppercase tracking-[0.2em] mb-1">
          {t(greetingKey, defaultGreeting)}
        </span>
        <span>{userName}</span>
      </h2>
      <p className="text-premium-on-surface/60 text-sm mt-2 max-w-[280px]">
        {t('premium_welcome_sub', 'Prêt pour votre nouveau voyage spirituel aujourd\'hui ?')}
      </p>
    </div>
  );
};
