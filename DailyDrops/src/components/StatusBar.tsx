import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 select-none text-xs font-semibold z-20">
      <span>{time}</span>

      {/* Speaker / Camera Notch Pill */}
      <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center opacity-90">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800 ring-1 ring-slate-700"></div>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-1.5 text-slate-700">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <BatteryMedium className="w-4 h-4" />
      </div>
    </div>
  );
};
