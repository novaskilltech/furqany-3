import React from 'react';

export const PremiumPrayerTimes: React.FC = () => {
  const prayers = [
    { name: 'Fajr', time: '05:42', active: false },
    { name: 'Dhuhr', time: '13:02', active: true },
    { name: 'Asr', time: '16:45', active: false },
    { name: 'Maghrib', time: '19:12', active: false },
    { name: 'Isha', time: '20:58', active: false },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {prayers.map((prayer) => (
        <div 
          key={prayer.name}
          className={`flex flex-col items-center p-3 py-6 rounded-2xl transition-all duration-300 ${
            prayer.active 
              ? 'bg-gradient-to-br from-premium-secondary to-premium-secondary-700 text-white shadow-lg scale-105' 
              : 'bg-premium-surface-low border border-premium-surface-high text-premium-on-surface/60'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80">{prayer.name}</span>
          <span className={`text-sm font-bold ${prayer.active ? 'text-white' : 'text-premium-on-surface'}`}>
            {prayer.time}
          </span>
          {prayer.active && (
            <div className="w-1 h-1 bg-white rounded-full mt-2 animate-pulse" />
          )}
        </div>
      ))}
    </div>
  );
};
