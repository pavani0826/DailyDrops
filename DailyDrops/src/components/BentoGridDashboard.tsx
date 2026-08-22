import React from 'react';
import { UserProfile, DayProgress, Challenge, AchievementBadge, BeverageType } from '../types';
import { WaterSprite } from './WaterSprite';
import { soundManager } from '../utils/audio';
import { Flame, Droplets, Plus, Trophy, Bell, Award, ArrowUpRight, Check, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BentoGridDashboardProps {
  profile: UserProfile;
  todayProgress: DayProgress;
  history: DayProgress[];
  currentStreak: number;
  challenges: Challenge[];
  achievements: AchievementBadge[];
  onOpenAddModal: () => void;
  onQuickAdd: (ml: number, bev?: BeverageType) => void;
  onOpenAchievementsModal: () => void;
  onOpenWeeklyModal: () => void;
  onOpenFeedbackModal: () => void;
  onNavigateTab: (tab: 'today' | 'progress' | 'challenges' | 'settings') => void;
}

export const BentoGridDashboard: React.FC<BentoGridDashboardProps> = ({
  profile,
  todayProgress,
  history,
  currentStreak,
  challenges,
  achievements,
  onOpenAddModal,
  onQuickAdd,
  onOpenAchievementsModal,
  onOpenWeeklyModal,
  onOpenFeedbackModal,
  onNavigateTab,
}) => {
  const currentMl = todayProgress.consumedMl;
  const goalMl = todayProgress.goalMl || profile.dailyGoalMl;
  const percentage = Math.min(Math.round((currentMl / goalMl) * 100), 100);

  const activeChallenge = challenges[0] || {
    title: 'No active challenge',
    currentSharedL: 0,
    totalSharedGoalL: 0,
    participants: [],
  };

  const unlockedBadges = achievements.filter((a) => a.unlocked).length;

  // Initials for avatar badge
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'MD';

  // Hourly timeline demo for Bento hourly progress bar
  const hourlyBars = [
    { label: '8 AM', height: 40, ml: 250, active: true },
    { label: '10 AM', height: 75, ml: 500, active: true },
    { label: '12 PM', height: 100, ml: 500, active: true },
    { label: '2 PM', height: 35, ml: 250, active: true },
    { label: '4 PM', height: 60, ml: 350, active: percentage > 60 },
    { label: '6 PM', height: 45, ml: 250, active: percentage > 80 },
    { label: '8 PM', height: 20, ml: 150, active: percentage >= 100 },
    { label: '10 PM', height: 15, ml: 100, active: false },
  ];

  const getMotivationalQuote = () => {
    if (percentage >= 100) return '“Goal completed! Your body is performing at its absolute peak!”';
    if (percentage >= 70) return '“Your body is a temple, keep the crystal flow going!”';
    if (percentage >= 40) return '“Hydration boosts focus and unlocks your best energy.”';
    return '“A crisp glass of water is the best gift to yourself today.”';
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 select-none animate-fade-in">
      {/* Bento Header */}
      <header className="flex flex-wrap justify-between items-center gap-4 bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-[2rem] border border-blue-100/80 shadow-md shadow-blue-100/40">
        {/* User Profile info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white border-4 border-white shadow-md text-xl font-black">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <WaterSprite avatar={profile.avatar} size={26} showRipples={false} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">Daily Drop</h1>
              <span className="text-[10px] uppercase tracking-widest font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-200/60">
                Bento Grid
              </span>
            </div>
            <p className="text-blue-600 font-semibold text-sm sm:text-base">
              Good morning, {profile.name}!
            </p>
          </div>
        </div>

        {/* Action Pills & Streak */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2 border border-blue-100">
            <span className="text-orange-500 text-lg">🔥</span>
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{currentStreak} Day Streak</span>
          </div>

          <button
            onClick={onOpenAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl shadow-md font-bold text-sm sm:text-base transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Water</span>
          </button>
        </div>
      </header>

      {/* Main Bento Grid Layout: 12 Columns */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* TILE 1: Large Primary Bento Box (Today's Target & Bottle/Fill Meter) -> col-span-5 */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 p-6 sm:p-8 flex flex-col items-center justify-between border border-blue-100/80 relative overflow-hidden group">
          {/* Top subtle progress rail */}
          <div className="absolute top-0 left-0 w-full h-2.5 bg-blue-100">
            <div
              className="h-full bg-blue-600 transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Today's Target Numerals */}
          <div className="text-center mt-2">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
              Today's Target
            </h2>
            <div className="text-4xl sm:text-5xl font-black text-blue-950 tracking-tight">
              {currentMl.toLocaleString()}{' '}
              <span className="text-xl sm:text-2xl text-blue-400 font-bold">
                / {goalMl.toLocaleString()}ml
              </span>
            </div>
          </div>

          {/* Fluid Bento Hydration Bottle / Chamber with Sprite */}
          <div className="relative w-64 h-80 flex items-end justify-center bg-blue-50/70 rounded-b-full rounded-t-[5rem] border-8 border-white shadow-inner overflow-hidden my-4 group-hover:scale-102 transition-transform duration-300">
            {/* Center percentage badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="text-center bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl shadow-xs border border-white/60">
                <div className="text-5xl sm:text-6xl font-black text-blue-950 leading-none">
                  {percentage}%
                </div>
                <div className="text-xs font-extrabold text-blue-700 uppercase tracking-wider mt-1">
                  Hydrated
                </div>
              </div>
            </div>

            {/* Floating Water Sprite Mascot Inside Water Level */}
            <div
              className="absolute z-10 transition-all duration-700 pointer-events-none"
              style={{ bottom: `calc(${Math.min(percentage, 82)}% - 15px)` }}
            >
              <WaterSprite
                avatar={profile.avatar}
                mood={percentage >= 100 ? 'dancing' : 'cheering'}
                size={95}
                showRipples={false}
              />
            </div>

            {/* Dynamic Water Wave Fill */}
            <div
              className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 opacity-85 transition-all duration-1000 ease-out relative"
              style={{ height: `${Math.max(percentage, 12)}%` }}
            >
              {/* Surface water meniscus wave line */}
              <div
                className="absolute top-0 left-0 w-full h-5 bg-blue-300/80 rounded-full"
                style={{ transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Quote Card */}
          <div className="w-full bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="italic text-blue-900 font-semibold text-xs sm:text-sm">
              {getMotivationalQuote()}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE BENTO TILES (col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* TOP ROW: Quick Log Tile (col-span-7 or 4) & Challenges Bento Tile (col-span-3) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            {/* Quick Log Tile -> sm:col-span-7 */}
            <div className="sm:col-span-7 bg-white rounded-[2rem] shadow-md p-6 border border-blue-100/80 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                  Quick Log
                </h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  Instant Drop
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    soundManager.playWaterDrop();
                    onQuickAdd(250);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-blue-50/90 border-2 border-transparent hover:border-blue-400 hover:bg-blue-100 transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                    💧
                  </span>
                  <span className="font-black text-blue-950 text-sm sm:text-base">250ml</span>
                  <span className="text-[10px] text-slate-400 font-medium">Small Cup</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playWaterPour();
                    onQuickAdd(500);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-blue-100/90 border-2 border-transparent hover:border-blue-400 hover:bg-blue-200 transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🥤
                  </span>
                  <span className="font-black text-blue-950 text-sm sm:text-base">500ml</span>
                  <span className="text-[10px] text-blue-700/80 font-semibold">Standard</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playWaterPour();
                    onQuickAdd(750);
                  }}
                  className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-blue-200/80 border-2 border-transparent hover:border-blue-500 hover:bg-blue-300 transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-2xl sm:text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🏺
                  </span>
                  <span className="font-black text-blue-950 text-sm sm:text-base">750ml</span>
                  <span className="text-[10px] text-blue-800 font-semibold">Bottle</span>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Smart reminder: every {profile.reminderIntervalMinutes} mins</span>
                <button
                  onClick={onOpenAddModal}
                  className="font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>Custom amount</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vibrant Challenges Bento Tile -> sm:col-span-5 (Styled exactly with #10B981 emerald tone) */}
            <div className="sm:col-span-5 bg-[#10B981] rounded-[2rem] shadow-md p-6 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold uppercase text-xs tracking-widest opacity-90">
                    Challenges
                  </h3>
                  <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <p className="text-lg sm:text-xl font-black mt-2 leading-tight">
                  {activeChallenge.title}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center text-xs font-black text-emerald-800">
                      M
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-emerald-500 flex items-center justify-center text-xs font-black text-blue-800">
                      J
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-slate-700">
                      +4
                    </div>
                  </div>
                  <span className="text-xs font-semibold opacity-95">
                    {activeChallenge.participants?.length > 0
                      ? activeChallenge.participants.map((p) => p.name).join(' + ')
                      : 'No participants yet'}
                  </span>
                </div>

                <div className="mt-4 bg-white/20 backdrop-blur-xs rounded-2xl p-3 border border-white/20">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Team Progress</span>
                    <span>{activeChallenge.currentSharedL} / {activeChallenge.totalSharedGoalL}L</span>
                  </div>
                  <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeChallenge.currentSharedL / activeChallenge.totalSharedGoalL) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Watermark Trophy */}
              <div className="absolute -right-4 -bottom-4 opacity-20 text-8xl rotate-12 pointer-events-none">
                🏆
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Hourly & 7-Day Progress Bento Tile */}
          <div className="bg-white rounded-[2rem] shadow-md p-6 border border-blue-100/80 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                  Hourly & Weekly Progress
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Visual intake distribution across the day
                </p>
              </div>
              <button
                onClick={onOpenWeeklyModal}
                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>View History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bento Chart Columns */}
            <div className="relative pt-4 pb-1">
              <div className="flex items-end justify-between h-36 gap-2 sm:gap-3 px-2">
                {hourlyBars.map((bar, idx) => {
                  return (
                    <div
                      key={bar.label}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.ml}ml
                      </span>
                      <div className="w-full bg-slate-100 rounded-t-xl h-full flex items-end p-0.5">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            bar.active
                              ? idx % 2 === 0
                                ? 'bg-blue-400 group-hover:bg-blue-500'
                                : 'bg-blue-600 group-hover:bg-blue-700'
                              : 'bg-blue-100'
                          }`}
                          style={{ height: `${bar.height}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time axis */}
              <div className="flex justify-between mt-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter px-2 border-t border-slate-100 pt-1.5">
                <span>8 AM</span>
                <span>10 AM</span>
                <span>12 PM</span>
                <span>2 PM</span>
                <span>4 PM</span>
                <span>6 PM</span>
                <span>8 PM</span>
                <span>10 PM</span>
              </div>
            </div>

            {/* Bottom Row Mini Bento Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
              <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-2">
                <span className="text-lg">💧</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">This Week</span>
                  <span className="text-xs font-black text-blue-950">10.75 L</span>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Best Day</span>
                  <span className="text-xs font-black text-blue-950">Tue · 2.1 L</span>
                </div>
              </div>

              <div
                onClick={onOpenAchievementsModal}
                className="p-2.5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="text-lg">🏆</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Badges</span>
                  <span className="text-xs font-black text-blue-950">{unlockedBadges} Unlocked</span>
                </div>
              </div>

              <div
                onClick={onOpenFeedbackModal}
                className="p-2.5 rounded-2xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-100 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span className="text-lg">💬</span>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Community</span>
                  <span className="text-xs font-black text-blue-950">Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bento Bottom Navigation Bar */}
      <nav className="h-16 bg-white rounded-2xl shadow-lg border border-blue-100/80 flex items-center justify-around px-6 sm:px-12">
        <button
          onClick={() => onNavigateTab('today')}
          className="flex flex-col items-center text-blue-600 font-bold hover:scale-105 transition-all cursor-pointer"
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Home</span>
        </button>

        <button
          onClick={() => onNavigateTab('progress')}
          className="flex flex-col items-center text-slate-400 hover:text-blue-600 font-bold hover:scale-105 transition-all cursor-pointer"
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Stats</span>
        </button>

        <button
          onClick={() => onNavigateTab('challenges')}
          className="flex flex-col items-center text-slate-400 hover:text-blue-600 font-bold hover:scale-105 transition-all cursor-pointer"
        >
          <span className="text-xl">⚔️</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Social</span>
        </button>

        <button
          onClick={() => onNavigateTab('settings')}
          className="flex flex-col items-center text-slate-400 hover:text-blue-600 font-bold hover:scale-105 transition-all cursor-pointer"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
};
