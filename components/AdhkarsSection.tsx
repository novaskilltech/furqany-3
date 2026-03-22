
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ADHKARS, Adhkar } from '../adhkars';

interface AdhkarsSectionProps {
  onBack: () => void;
  theme: string;
}

export const AdhkarsSection: React.FC<AdhkarsSectionProps> = ({ onBack, theme }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [counts, setCounts] = useState<Record<string, number>>({});

  const filteredAdhkars = ADHKARS.filter(a => a.category === activeTab || a.category === 'both');

  const handleCount = (id: string, max: number) => {
    setCounts(prev => ({
      ...prev,
      [id]: Math.min((prev[id] || 0) + 1, max)
    }));
  };

  const resetCount = (id: string) => {
    setCounts(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center text-rose-600 border border-rose-100"
        >
          <span className="text-xl">←</span>
        </button>
        <h2 className={`text-xl font-black ${theme === 'rose' ? 'text-rose-900' : 'text-emerald-900'}`}>
          {t('adhkars_title', 'Invocations')}
        </h2>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="bg-white/40 backdrop-blur-md p-1 rounded-3xl border border-white/60 flex shadow-sm">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'morning' ? 'bg-white shadow-md text-orange-600 scale-[1.02]' : 'text-gray-400'}`}
          >
            <span className="text-lg">🌅</span> {t('morning', 'Matin')}
          </button>
          <button
            onClick={() => setActiveTab('evening')}
            className={`flex-1 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'evening' ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-gray-400'}`}
          >
            <span className="text-lg">🌙</span> {t('evening', 'Soir')}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {filteredAdhkars.map((adhkar) => {
          const currentCount = counts[adhkar.id] || 0;
          const isDone = currentCount >= adhkar.repeat;

          return (
            <div 
              key={adhkar.id}
              className={`bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-sm border-2 transition-all ${isDone ? 'border-emerald-300 bg-emerald-50/50' : 'border-white/80'}`}
            >
              <p className="text-right text-2xl font-['Amiri'] leading-relaxed mb-4 text-gray-800" dir="rtl">
                {adhkar.arabic}
              </p>
              
              <p className="text-xs font-bold text-rose-500/70 mb-2 italic tracking-tight">
                {adhkar.transcription}
              </p>
              
              <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6">
                {adhkar.translation[i18n.language as keyof typeof adhkar.translation] || adhkar.translation.fr}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 border border-rose-50">
                    <span className="text-sm">🔊</span>
                  </button>
                  {isDone && (
                    <button 
                      onClick={() => resetCount(adhkar.id)}
                      className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 border border-gray-100"
                    >
                      <span className="text-xs">🔄</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleCount(adhkar.id, adhkar.repeat)}
                  disabled={isDone}
                  className={`px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-3 transition-all ${isDone ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white shadow-md text-gray-700 active:scale-95'}`}
                >
                  {isDone ? (
                    <><span>✅</span> {t('completed', 'Terminé')}</>
                  ) : (
                    <>
                      <span className="text-rose-500">{currentCount} / {adhkar.repeat}</span>
                      <span>✨ {t('count', 'Compter')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
