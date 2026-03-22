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
    { id: 'q1', name: '1er Quart', range: 'Fatiha - Al-An\'am', icon: '🌱', progress: 100, color: 'bg-[#064E3B] text-white' },
    { id: 'q2', name: '2ème Quart', range: 'Al-A\'raf - Al-Isra', icon: '✨', progress: 45, color: 'bg-white border border-premium-secondary/20 text-[#064E3B]' },
    { id: 'q3', name: '3ème Quart', range: 'Al-Kahf - Fatir', icon: '📜', progress: 0, color: 'bg-white border border-premium-secondary/20 text-[#064E3B]' },
    { id: 'q4', name: '4ème Quart', range: 'Ya-Sin - An-Nas', icon: '🌟', progress: 5, color: 'bg-white border border-premium-secondary/20 text-[#064E3B]' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {journeys.map((journey) => (
        <button
          key={journey.id}
          onClick={() => onSelectQuarter(journey.id)}
          className={`${journey.color} p-5 rounded-[2rem] shadow-sm hover:shadow-premium transition-all flex items-center justify-between group overflow-hidden relative`}
        >
          <div className="flex items-center gap-5 relative z-10 w-full">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner border border-white/20">
              {journey.icon}
            </div>
            <div className="text-left flex-1">
              <h4 className="font-black text-lg leading-tight mb-0.5">
                {journey.name}
              </h4>
              <p className="text-[10px] font-bold opacity-70 mb-2 uppercase tracking-wide">
                {journey.range}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${journey.id === 'q1' ? 'bg-[#F59E0B]' : 'bg-[#064E3B]'} transition-all duration-1000`}
                    style={{ width: `${journey.progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter opacity-80">
                  {journey.progress}%
                </span>
              </div>
            </div>
          </div>
          <div className="ml-4 opacity-60 group-hover:translate-x-1 transition-transform">
            <span className="text-xl">→</span>
          </div>
        </button>
      ))}
    </div>
  );
};
