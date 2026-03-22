
import React, { useState, useEffect } from 'react';

export const Loader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 1000; // 1 second
    const interval = 20; // 20ms updates
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for fade out
          }, 200);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-end pb-24 bg-cover bg-center transition-opacity duration-500 ${progress >= 100 ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundImage: 'url("/og-image.png")' }}
    >
      <div className="w-64 h-3 bg-white/20 backdrop-blur-md rounded-full overflow-hidden border border-white/30 shadow-xl">
        <div 
          className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(225,29,72,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 text-white font-black text-lg tracking-widest animate-pulse drop-shadow-md uppercase">
        Chargement...
      </p>
    </div>
  );
};
