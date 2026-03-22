import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const PrayerTimes: React.FC = () => {
  const { t } = useTranslation();
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
          const data = await response.json();
          setTimes(data.data.timings);
          setLoading(false);
        } catch (err) {
          setError('Erreur lors de la récupération des horaires');
          setLoading(false);
        }
      },
      (err) => {
        setError('Accès à la position refusé');
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <div className="text-center p-4 text-sm font-bold text-gray-500">{t('prayer_times_loading')}</div>;
  if (error) {
    const errorKey = error === 'Géolocalisation non supportée' ? 'geo_not_supported' : 
                    error === 'Accès à la position refusé' ? 'geo_denied' : 'prayer_times_error';
    return <div className="text-center p-4 text-sm font-bold text-rose-500">{t(errorKey)}</div>;
  }
  if (!times) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-white/50 mb-6">
      <h4 className="font-black mb-3 text-gray-800">{t('prayer_times_title')}</h4>
      <div className="grid grid-cols-5 gap-2 text-center">
        {Object.entries(times).filter(([key]) => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key)).map(([name, time]) => (
          <div key={name} className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-500 mb-1">{name}</span>
            <div className="w-full bg-emerald-100/80 text-emerald-800 rounded-xl py-2 font-black text-xs">
              {time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerTimes;
