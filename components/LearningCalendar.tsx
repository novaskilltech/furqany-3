import React from 'react';
import { useTranslation } from 'react-i18next';

interface LearningCalendarProps {
  theme: string;
}

const LearningCalendar: React.FC<LearningCalendarProps> = ({ theme }) => {
  const { t } = useTranslation();
  const days = [
    { name: t('days_short.mon'), type: 'memorization' },
    { name: t('days_short.tue'), type: 'memorization' },
    { name: t('days_short.wed'), type: 'memorization' },
    { name: t('days_short.thu'), type: 'memorization' },
    { name: t('days_short.fri'), type: 'memorization' },
    { name: t('days_short.sat'), type: 'revision' },
    { name: t('days_short.sun'), type: 'revision' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/50 mb-6">
      <h4 className={`font-black mb-3 ${theme === 'rose' ? 'text-rose-800' : 'text-emerald-800'}`}>{t('calendar_title')}</h4>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xs font-bold text-gray-500 mb-1">{day.name}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
              day.type === 'memorization' 
                ? (theme === 'rose' ? 'bg-rose-200 text-rose-700' : 'bg-emerald-200 text-emerald-700')
                : (theme === 'rose' ? 'bg-amber-200 text-amber-700' : 'bg-amber-200 text-amber-700')
            }`}>
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningCalendar;
