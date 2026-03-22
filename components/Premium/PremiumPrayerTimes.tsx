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
    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
      {prayers.map((prayer) => (
        <div 
          key={prayer.name}
          className={`flex-none w-24 snap-start flex flex-col items-center p-4 py-8 rounded-[2rem] transition-all duration-500 border border-white/50 ${
            prayer.active 
              ? 'bg-[#064E3B] text-white shadow-lg scale-105' 
              : 'bg-white/60 backdrop-blur-sm text-[#064E3B]/60 shadow-sm'
          }`}
        >
          {prayer.active && (
            <span className="absolute -top-2 bg-premium-secondary text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce">
                CURRENT
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">{prayer.name}</span>
          <span className={`text-lg font-black ${prayer.active ? 'text-white' : 'text-[#064E3B]'}`}>
            {prayer.time}
          </span>
          {prayer.active && (
            <div className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full mt-3 shadow-[0_0_10px_#F59E0B]" />
          )}
        </div>
      ))}
    </div>
  );
};
