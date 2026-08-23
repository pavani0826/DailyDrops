import React, { useState, useEffect } from 'react';
import { UserProfile, DayProgress } from '../types';
import { WaterSprite } from './WaterSprite';
import { CircularProgress } from './CircularProgress';
import { Bell, Droplet, Plus, History, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TodayScreenProps {
  profile: UserProfile;
  todayProgress: DayProgress;
  onQuickAdd: (amountMl: number) => void;
  onOpenAddModal: () => void;
  onOpenReminderSettings: () => void;
  onUndoLast: () => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  profile,
  todayProgress,
  onQuickAdd,
  onOpenAddModal,
  onOpenReminderSettings,
  onUndoLast,
}) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const currentMl = todayProgress.consumedMl;
  const goalMl = todayProgress.goalMl || profile.dailyGoalMl;
  const percentage = Math.round((currentMl / goalMl) * 100);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };
  // Calculate the actual next reminder time based on the real interval
  const getNextReminderTime = () => {
    const next = new Date(now + profile.reminderIntervalMinutes * 60 * 1000);
    return next.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Dynamic motivation text matching sprite's state
  const getMotivationalNote = () => {
    if (percentage === 0) return "Start your day with a crisp, refreshing glass!";
    if (percentage < 30) return "You're building a clear-water kind of day";
    if (percentage < 60) return "Great rhythm! Keep feeding the flow";
    if (percentage < 90) return "Almost at the peak! Stay wonderfully hydrated";
    if (percentage < 100) return "Just one small sip to hit your target!";
    return "Goal achieved! Your sprite is dancing with pure joy ✨";
  };

  const getSpriteMood = () => {
    if (percentage >= 100) return 'dancing';
    if (percentage >= 50) return 'cheering';
    if (percentage > 0) return 'cheering';
    return 'thirsty';
  };

  return (
      <div className="flex-1 flex flex-col justify-between px-5 pt-1 pb-2 select-none overflow-y-auto max-w-lg mx-auto w-full">
      {/* Top Section: Greeting & Sprite */}
      <div className="flex items-start justify-between relative mt-1">
        <div className="flex-1 pr-2 pt-1">
          <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            {getGreeting()}, {profile.name}
          </h1>
          <p className="text-blue-600/80 text-xs sm:text-sm mt-0.5 font-medium">
            Your water sprite is cheering you on
          </p>
          <p className="text-blue-700 text-xs sm:text-sm mt-2.5 font-bold leading-snug">
            {getMotivationalNote()}
          </p>
        </div>

        {/* Mascot Character */}
        <div className="flex-shrink-0 -mt-2 -mr-2">
          <WaterSprite
            avatar={profile.avatar}
            mood={getSpriteMood()}
            size={105}
            showRipples={true}
          />
        </div>
      </div>

      {/* Main Hydration Gauge */}
      <div className="my-2.5 flex flex-col items-center justify-center">
        <div className="relative p-3 bg-white rounded-full shadow-xl shadow-blue-100/50 border border-blue-50">
          <CircularProgress
            currentMl={currentMl}
            goalMl={goalMl}
            size={175}
            strokeWidth={14}
            color="#2563eb"
          />
        </div>
      </div>

      {/* Next Reminder Row Banner */}
      <button
        onClick={onOpenReminderSettings}
        className="w-full bg-blue-50/70 hover:bg-blue-100/60 border border-blue-100 rounded-2xl p-3 flex items-center justify-between text-left transition-all duration-200 cursor-pointer shadow-xs mb-2 group"
        >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-blue-950 text-xs sm:text-sm font-bold block">
              Next reminder
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Smart interval: every {profile.reminderIntervalMinutes} mins
            </span>
          </div>
        </div>

        <div className="flex items-center text-blue-600 font-bold text-xs sm:text-sm">
            <span>Today at {getNextReminderTime()}</span>
          <span className="ml-1.5 text-blue-400 text-xs">&gt;</span>
        </div>
      </button>

      {/* Quick Water Logging Actions (3 cards in Bento style) */}
       <div className="mb-2">
        <div className="grid grid-cols-3 gap-2">
          {/* 250 ml */}
          <button
            onClick={() => {
              soundManager.playWaterDrop();
              onQuickAdd(250);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-100 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-blue-500 mb-1 group-hover:scale-105 transition-transform shadow-xs">
              <span className="text-xl">💧</span>
            </div>
            <span className="text-blue-950 font-black text-xs sm:text-sm">250ml</span>
            <span className="text-[10px] text-slate-400 font-medium">Small Cup</span>
          </button>

          {/* 500 ml */}
          <button
            onClick={() => {
              soundManager.playWaterPour();
              onQuickAdd(500);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-100/70 hover:bg-blue-200/70 border border-blue-200/80 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-blue-600 mb-1 group-hover:scale-105 transition-transform shadow-xs">
              <span className="text-xl">🥤</span>
            </div>
            <span className="text-blue-950 font-black text-xs sm:text-sm">500ml</span>
            <span className="text-[10px] text-blue-700/80 font-semibold">Standard</span>
          </button>

          {/* 750 ml */}
          <button
            onClick={() => {
              soundManager.playWaterPour();
              onQuickAdd(750);
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-200/60 hover:bg-blue-300/60 border border-blue-200 shadow-xs active:scale-95 transition-all duration-150 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-blue-700 mb-1 group-hover:scale-105 transition-transform shadow-xs">
              <span className="text-xl">🏺</span>
            </div>
            <span className="text-blue-950 font-black text-xs sm:text-sm">750ml</span>
            <span className="text-[10px] text-blue-800 font-semibold">Bottle</span>
          </button>
        </div>
      </div>

      {/* Log a different amount Button */}
      <div className="space-y-2">
        <button
          onClick={onOpenAddModal}
          className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer active:scale-98 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log a different amount</span>
        </button>

        {/* Quick undo/logs helper */}
        {todayProgress.logs.length > 0 && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <History className="w-3 h-3" />
              {todayProgress.logs.length} drink{todayProgress.logs.length > 1 ? 's' : ''} logged today
            </span>
            <button
              onClick={onUndoLast}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-500 font-semibold transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-slate-100"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo last ({todayProgress.logs[todayProgress.logs.length - 1]?.amountMl}ml)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
