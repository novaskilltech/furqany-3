import React from 'react';

export const PremiumStories: React.FC = () => {
  const stories = [
    { 
      id: 's1', 
      title: 'Le Prophète Yusuf (as)', 
      color: 'bg-amber-50', 
      icon: '👔', 
      tag: 'Culte',
      author: 'Abdallah' 
    },
    { 
      id: 's2', 
      title: 'L\'Arche de Nuh (as)', 
      color: 'bg-blue-50', 
      icon: '🚢', 
      tag: 'Miracle',
      author: 'Nova' 
    },
    { 
      id: 's3', 
      title: 'La patience d\'Ayyub (as)', 
      color: 'bg-rose-50', 
      icon: '🌿', 
      tag: 'Leçon',
      author: 'Sage' 
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
      {stories.map((story) => (
        <div 
          key={story.id}
          className={`${story.color} min-w-[240px] p-6 rounded-[32px] border border-black/5 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm`}
        >
          <div className="flex items-start justify-between mb-12">
            <span className="text-[10px] font-bold text-premium-on-surface/40 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-lg">
              {story.tag}
            </span>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm border border-black/5">
              {story.icon}
            </div>
          </div>
          <div>
            <h5 className="text-lg font-bold text-premium-on-surface mb-2 leading-tight">
              {story.title}
            </h5>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-premium-secondary/20 border border-premium-secondary/10" />
              <span className="text-[10px] font-bold text-premium-on-surface/40 uppercase tracking-widest italic">
                Par {story.author}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
