import React from 'react';

export const PremiumStories: React.FC = () => {
  const stories = [
    { 
      id: 's1', 
      title: 'Le Prophète Yusuf (as)', 
      color: 'bg-primary/5', 
      icon: 'person', 
      tag: 'Culte',
      author: 'Abdallah' 
    },
    { 
      id: 's2', 
      title: 'L\'Arche de Nuh (as)', 
      color: 'bg-secondary/5', 
      icon: 'directions_boat', 
      tag: 'Miracle',
      author: 'Nova' 
    },
    { 
      id: 's3', 
      title: 'La patience d\'Ayyub (as)', 
      color: 'bg-tertiary-container/10', 
      icon: 'eco', 
      tag: 'Leçon',
      author: 'Sage' 
    },
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 no-scrollbar snap-x">
      {stories.map((story) => (
        <div 
          key={story.id}
          className={`${story.color} min-w-[260px] p-8 rounded-[2.5rem] border border-surface-variant/20 flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm snap-center group`}
        >
          <div className="flex items-start justify-between mb-10">
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-surface-container-highest/50 px-3 py-1.5 rounded-pill border border-surface-variant/20">
              {story.tag}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-2xl text-primary shadow-sm border border-surface-variant/30 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-3xl">{story.icon}</span>
            </div>
          </div>
          <div>
            <h5 className="text-xl font-black text-on-surface mb-3 leading-tight">
              {story.title}
            </h5>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/10" />
              <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest italic">
                Par {story.author}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
