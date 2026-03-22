import React from 'react';

export const PremiumPrayerTimes: React.FC = () => {
  const [adhanEnabled, setAdhanEnabled] = React.useState(true);
  
  const prayers = [
    { name: 'Fajr', progress: 100, completed: true },
    { name: 'Dhuhr', progress: 50, current: true },
    { name: 'Asr', progress: 0 },
    { name: 'Maghrib', progress: 0 },
    { name: 'Isha', progress: 0 },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_rgba(45,52,50,0.06)] relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-4xl">light_mode</span>
          </div>
          <div>
            <p className="text-secondary font-bold text-sm tracking-widest uppercase">Prochaine Prière</p>
            <h3 className="text-3xl font-extrabold text-on-surface">Dhuhr <span className="text-secondary-dim font-medium text-2xl ml-2">12:45</span></h3>
          </div>
        </div>
        
        <button 
          onClick={() => setAdhanEnabled(!adhanEnabled)}
          className="flex items-center gap-3 bg-surface-container-high px-6 py-4 rounded-lg self-start md:self-center hover:bg-surface-variant transition-colors group"
        >
          <span className="text-on-surface font-bold">Rappel Adhan</span>
          <div className={`w-12 h-6 rounded-full relative p-1 flex items-center transition-colors ${adhanEnabled ? 'bg-primary justify-end' : 'bg-outline-variant justify-start'}`}>
            <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
          </div>
          <span 
            className={`material-symbols-outlined ${adhanEnabled ? 'text-primary' : 'text-outline-variant'}`}
            style={{ fontVariationSettings: `'FILL' ${adhanEnabled ? 1 : 0}` }}
          >
            {adhanEnabled ? 'notifications_active' : 'notifications_off'}
          </span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-5 gap-2">
        {prayers.map((prayer) => (
          <div key={prayer.name} className={`flex flex-col items-center gap-1 ${!prayer.current && !prayer.completed ? 'opacity-60' : prayer.completed ? 'opacity-40' : ''}`}>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${prayer.current ? 'text-primary' : ''}`}>
              {prayer.name}
            </span>
            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${prayer.completed ? 'bg-secondary w-full' : prayer.current ? 'bg-primary' : ''}`}
                style={{ width: prayer.current ? `${prayer.progress}%` : undefined }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
