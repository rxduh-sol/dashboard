import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface WeatherWidgetProps {
  onClick: () => void;
}

export default function WeatherWidget({ onClick }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=51.8887&longitude=0.9037&current_weather=true')
      .then(res => res.json())
      .then(data => setWeather(data.current_weather))
      .catch(err => console.error("Error fetching weather:", err));
  }, []);

  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour > 18;

  const getWeatherEmoji = (temp: number) => {
    if (isNight) return temp > 10 ? '🌙' : '🌑';
    if (temp > 20) return '☀️';
    if (temp > 10) return '🌤️';
    return temp > 0 ? '☁️' : '❄️';
  };

  if (!weather) return <div className="glass rounded-[24px] h-[64px] w-52 animate-pulse bg-white/10" />;

  return (
    <button 
      onClick={onClick}
      className="glass px-5 h-[64px] rounded-[24px] flex items-center justify-between gap-4 transition-all hover:bg-white/30 active:scale-95 border border-white/40 shadow-sm bg-white/20 min-w-[200px]"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getWeatherEmoji(weather.temperature)}</span>
        <div className="text-left leading-tight">
          <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Colchester</div>
          <div className="text-xl font-bold text-zinc-950">
            {Math.round(weather.temperature)}°
          </div>
        </div>
      </div>
      <ChevronDown size={16} className="text-zinc-400" />
    </button>
  );
}