import React from 'react';
import { useTranslation } from 'react-i18next';

interface DailyGlowProps {
  streak: number;
}

export const DailyGlow: React.FC<DailyGlowProps> = ({ streak }) => {
  const { t } = useTranslation();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Simulation des jours complétés (ici les 5 derniers jours)
  const completedDays = [0, 1, 2, 3, 4]; 
  const currentDayIndex = 4; // Vendredi

  return (
    <div className="bg-premium-surface-high p-6 rounded-[2.5rem] shadow-premium relative overflow-hidden group">
      {/* Decorative sun flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-premium-secondary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-premium-on-surface tracking-tight">
            {t('daily_glow_title', 'Daily Glow')}
          </h3>
          <p className="text-xs text-premium-secondary font-black uppercase tracking-widest mt-1">
            {streak} {t('days_streak', 'DAYS STREAK')} 🔥
          </p>
        </div>
        
        <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center border border-white/80 shadow-sm">
          <span className="text-2xl animate-pulse-slow">🌞</span>
        </div>
      </div>

      <div className="flex justify-between items-end px-2">
        {days.map((day, index) => {
          const isCompleted = completedDays.includes(index);
          const isCurrent = index === currentDayIndex;
          const isFuture = index > currentDayIndex;

          return (
            <div key={day} className="flex flex-col items-center gap-3">
              <div className={`
                relative h-14 w-10 sm:w-12 rounded-2xl flex items-center justify-center transition-all duration-300
                ${isCurrent ? 'bg-premium-secondary shadow-lg -translate-y-2 scale-110' : ''}
                ${isCompleted && !isCurrent ? 'bg-white border-2 border-premium-secondary/20 shadow-sm' : ''}
                ${isFuture ? 'bg-white/30 border-2 border-dashed border-white/40' : ''}
              `}>
                {isCompleted ? (
                   <span className={`text-xl ${isCurrent ? 'animate-bounce' : ''}`}>☀️</span>
                ) : (
                   <span className="text-xs font-black text-premium-secondary/30">?</span>
                )}
                
                {isCurrent && (
                  <div className="absolute -bottom-1 w-4 h-1 bg-white/80 rounded-full"></div>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-premium-secondary scale-110' : 'text-premium-on-surface/40'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
