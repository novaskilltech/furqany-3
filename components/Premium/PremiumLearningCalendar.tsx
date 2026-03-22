import React from 'react';

export const PremiumLearningCalendar: React.FC = () => {
  const days = [
    { label: 'L', number: '12', current: false, completed: true },
    { label: 'M', number: '13', current: false, completed: true },
    { label: 'M', number: '14', current: true, completed: false },
    { label: 'J', number: '15', current: false, completed: false },
    { label: 'V', number: '16', current: false, completed: false },
    { label: 'S', number: '17', current: false, completed: false },
    { label: 'D', number: '18', current: false, completed: false },
  ];

  return (
    <div className="flex items-center justify-between bg-premium-surface-low p-4 rounded-3xl border border-premium-surface-high shadow-sm">
      {days.map((day, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-premium-on-surface/40 uppercase tracking-widest">{day.label}</span>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            day.current 
              ? 'bg-premium-primary text-white shadow-md' 
              : day.completed
                ? 'bg-premium-secondary/10 text-premium-secondary'
                : 'text-premium-on-surface'
          }`}>
            {day.number}
          </div>
          {day.completed && (
            <div className="w-1 h-1 bg-premium-secondary rounded-full" />
          )}
        </div>
      ))}
    </div>
  );
};
