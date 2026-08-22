import React, { useState } from 'react';
import { AchievementBadge } from '../types';
import { Trophy, X, Lock, CheckCircle2, Award, Sparkles, Filter } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementBadge[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'streak' | 'volume' | 'habit' | 'social'>('all');

  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filteredBadges = achievements.filter((badge) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return badge.unlocked;
    return badge.category === filter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Trophy and progress */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-blue-950">Hydration Badges</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {unlockedCount} of {achievements.length} unlocked ({Math.round((unlockedCount / achievements.length) * 100)}%)
            </p>
          </div>
        </div>

        {/* Total Badge Progress Bar */}
        <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden mb-3.5">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-2">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'unlocked', label: 'Unlocked' },
            { id: 'streak', label: 'Streaks' },
            { id: 'volume', label: 'Volume' },
            { id: 'habit', label: 'Habits' },
            { id: 'social', label: 'Social' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                filter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Badges List Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                badge.unlocked
                  ? 'bg-white border-blue-100 shadow-sm'
                  : 'bg-blue-50/40 border-blue-50 opacity-75'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                    badge.unlocked
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-slate-200 text-slate-400 grayscale'
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-blue-950">{badge.title}</span>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 block leading-tight mt-0.5 font-medium">
                    {badge.description}
                  </span>
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className="w-24 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {badge.progressText || `${badge.progressPercent}%`}
                    </span>
                  </div>
                </div>
              </div>

              {badge.unlocked && (
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-lg whitespace-nowrap">
                  Unlocked
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
