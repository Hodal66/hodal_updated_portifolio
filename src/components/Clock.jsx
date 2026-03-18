import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Clock = () => {
  const [time, setTime] = useState(new Date());
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => num.toString().padStart(2, '0');

  const hours = formatNumber(time.getHours());
  const minutes = formatNumber(time.getMinutes());
  const seconds = formatNumber(time.getSeconds());

  return (
    <div className={`hidden lg:flex items-center gap-1 font-mono text-sm tracking-wider px-3 py-1.5 rounded-xl border transition-all duration-300 ${
      isDark 
        ? 'bg-white/5 border-white/10 text-primary-400' 
        : 'bg-slate-100 border-slate-200 text-primary-600'
    }`}>
      <span className="font-bold">{hours}</span>
      <span className="animate-pulse opacity-50">:</span>
      <span className="font-bold">{minutes}</span>
      <span className="animate-pulse opacity-50">:</span>
      <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{seconds}</span>
    </div>
  );
};

export default Clock;
