import React, { useState } from 'react';
import { UserProfile, DayProgress, AchievementBadge } from '../types';
import { WaterSprite } from './WaterSprite';
import { Droplet, Star, ChevronRight, Trophy, Flame, Calendar, Award } from 'lucide-react';

interface ProgressScreenProps {
  profile: UserProfile;
  history: DayProgress[];
  currentStreak: number;
  achievements: AchievementBadge[];
  onOpenAchievementsModal: () => void;
  onOpenWeeklyDetails: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  history,
  currentStreak,
  achievements,
  onOpenAchievementsModal,
  onOpenWeeklyDetails,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

 
  // Calculate total consumed this week
  const totalMlThisWeek = history.reduce((sum, day) => sum + day.consumedMl, 0);
  const totalLThisWeek = (totalMlThisWeek / 1000).toFixed(2);

  // Find best day
  let bestDay = history[0];
  history.forEach((day) => {
    if (!bestDay || day.consumedMl > bestDay.consumedMl) {
      bestDay = day;
    }
  });

  const bestDayName = bestDay ? bestDay.dayLabel : 'Tuesday';
  const bestDayL = bestDay ? (bestDay.consumedMl / 1000).toFixed(1) : '2.1';

  // Last 7 days data for chart
  const chartDays = history.slice(-7);
  const maxVolume = 2.5; // Max Y-scale in Liters

  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-3 select-none overflow-y-auto max-w-lg mx-auto w-full">
      {/* Streak Header & Sprite */}
      <div className="flex items-start justify-between relative mt-1">
        <div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">
              {currentStreak}
            </h1>
            <span className="text-2xl font-black text-blue-950">days</span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-bold uppercase tracking-widest">
            Current goal streak
          </p>
          <button
            onClick={onOpenWeeklyDetails}
            className="text-blue-600 text-xs sm:text-sm mt-2 font-bold flex items-center hover:underline cursor-pointer bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100"
          >
            <Flame className="w-3.5 h-3.5 mr-1 text-orange-500 fill-orange-400" />
            Keep the rhythm going
          </button>
        </div>

        <div className="flex-shrink-0 -mt-2 -mr-2">
          <WaterSprite
            avatar={profile.avatar}
            mood="cheering"
            size={120}
            showRipples={true}
          />
        </div>
      </div>

      {/* 7 Days Bar Chart Card (Bento Style) */}
      <div className="mt-3.5 p-4 rounded-[2rem] bg-white border border-blue-100 shadow-xl shadow-blue-100/40">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Last 7 days</span>
            <span className="text-blue-400 text-[10px] font-bold">(L)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-600 text-[11px] font-bold">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-blue-500 inline-block"></span>
            <span>Daily goal {(profile.dailyGoalMl / 1000).toFixed(1)} L</span>
          </div>
        </div>

        {/* Bar Chart Area */}
        <div className="relative h-44 w-full pt-4 pb-2">
          {/* Daily Goal dashed guideline at 2.0L */}
          <div
            className="absolute w-full border-b border-dashed border-blue-400/80 z-10 pointer-events-none flex justify-end"
            style={{ bottom: `${(profile.dailyGoalMl / 1000 / maxVolume) * 78}%` }}
          >
            <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md -top-2.5 relative font-bold border border-blue-100">
              Goal
            </span>
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-blue-200 w-full"></div>
            <div className="border-b border-blue-200 w-full"></div>
            <div className="border-b border-blue-200 w-full"></div>
            <div className="border-b border-blue-200 w-full"></div>
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end justify-between px-1 z-20">
            {chartDays.map((item, idx) => {
              const liters = item.consumedMl / 1000;
              const barHeightPct = Math.min((liters / maxVolume) * 100, 100);
              const isGoalMet = item.consumedMl >= (item.goalMl || profile.dailyGoalMl);
              const isSelected = selectedDayIdx === idx;

              return (
                <div
                  key={item.date}
                  onClick={() => setSelectedDayIdx(idx)}
                  className="flex flex-col items-center flex-1 mx-1 group cursor-pointer"
                >
                  {/* Top value indicator */}
                  <span
                    className={`text-[10px] font-black mb-1 transition-colors ${
                      isSelected
                        ? 'text-blue-600 scale-110'
                        : isGoalMet
                        ? 'text-blue-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {liters > 0 ? (liters % 1 === 0 ? `${liters}.0` : liters.toFixed(liters < 1 ? 2 : (liters.toString().length > 3 ? 2 : 1))) : '0'}
                  </span>

                  {/* The Bar */}
                  <div className="w-full max-w-[28px] h-32 bg-blue-50 rounded-t-xl relative flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isGoalMet
                          ? 'bg-blue-600 shadow-xs'
                          : 'bg-blue-300'
                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] mt-1.5 font-bold ${
                      isSelected
                        ? 'text-blue-700'
                        : idx === chartDays.length - 1
                        ? 'text-blue-950'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Rows (This week & Best day) in Bento Cards */}
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {/* This week */}
        <button
          onClick={onOpenWeeklyDetails}
          className="p-3.5 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col justify-between transition-colors shadow-sm group cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Droplet className="w-3.5 h-3.5 fill-blue-500 text-blue-600" />
            </div>
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">This week</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-blue-950 font-black text-xs sm:text-sm">
            <span>{totalLThisWeek} L total</span>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </div>
        </button>

        {/* Best day */}
        <button
          onClick={onOpenWeeklyDetails}
          className="p-3.5 bg-white hover:bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col justify-between transition-colors shadow-sm group cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Best day</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-blue-950 font-black text-xs sm:text-sm">
            <span>{bestDayName} · {bestDayL} L</span>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </div>
        </button>
      </div>

      {/* Achievements Section */}
      <div className="mt-3.5 mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Achievements</h2>
          </div>
          <button
            onClick={onOpenAchievementsModal}
            className="text-blue-600 text-xs font-bold hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Achievements Badge Cards Horizontal Row */}
        <div className="grid grid-cols-4 gap-2">
          {achievements.slice(0, 4).map((badge) => (
            <div
              key={badge.id}
              onClick={onOpenAchievementsModal}
              className={`p-2.5 rounded-2xl flex flex-col items-center text-center border cursor-pointer transition-all hover:scale-102 ${
                badge.unlocked
                  ? 'bg-white border-blue-100 shadow-sm'
                  : 'bg-slate-50/70 border-slate-100 opacity-80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base mb-1.5 shadow-2xs ${
                  badge.unlocked
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-slate-100 text-slate-400 grayscale'
                }`}
              >
                {badge.icon}
              </div>
              <span className="text-[11px] font-bold text-blue-950 truncate w-full leading-tight">
                {badge.title}
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                {badge.progressText || badge.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
