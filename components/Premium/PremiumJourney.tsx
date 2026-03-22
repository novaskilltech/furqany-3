import React from 'react';
import { UserProgress } from '../../types';

interface PremiumJourneyProps {
  progress: UserProgress;
  onSelectQuarter: (quarterId: string) => void;
}

export const PremiumJourney: React.FC<PremiumJourneyProps> = ({ 
  progress, 
  onSelectQuarter 
}) => {
  const journeys = [
    { id: 'q1', name: 'Al-Fatiha & Début', icon: '🌱', progress: 100 },
    { id: 'q2', name: 'Vers la Lumière', icon: '✨', progress: 45 },
    { id: 'q3', name: 'Sagesse Antique', icon: '📜', progress: 0 },
    { id: 'q4', name: 'Jouz Amma', icon: '🌟', progress: 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {journeys.map((journey) => (
        <button
          key={journey.id}
          onClick={() => onSelectQuarter(journey.id)}
          className="premium-journey-card p-4 rounded-3xl bg-premium-surface-high border-2 border-premium-surface-highest/10 hover:border-premium-primary/30 transition-all flex items-center justify-between group overflow-hidden relative"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-premium-surface-highest flex items-center justify-center text-2xl shadow-sm border border-white/5">
              {journey.icon}
            </div>
            <div className="text-left">
              <h4 className="font-bold text-premium-on-surface leading-tight mb-1 group-hover:text-premium-primary transition-colors">
                {journey.name}
              </h4>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-premium-surface-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-premium-primary transition-all duration-1000"
                    style={{ width: `${journey.progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-premium-secondary uppercase tracking-tighter">
                  {journey.progress}%
                </span>
              </div>
            </div>
          </div>
          <div className="premium-journey-arrow text-premium-secondary group-hover:translate-x-1 transition-transform">
            <span className="text-xl">→</span>
          </div>
          
          {/* Subtle background glow on hover */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-premium-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16 group-hover:bg-premium-primary/10 transition-all"></div>
        </button>
      ))}
    </div>
  );
};
