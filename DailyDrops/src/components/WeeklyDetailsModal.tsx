import React from 'react';
import { DayProgress, UserProfile } from '../types';
import { X, Calendar, Droplet, Star, TrendingUp } from 'lucide-react';

interface WeeklyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DayProgress[];
  profile: UserProfile;
}

export const WeeklyDetailsModal: React.FC<WeeklyDetailsModalProps> = ({
  isOpen,
  onClose,
  history,
  profile,
}) => {
  if (!isOpen) return null;

  const totalConsumedMl = history.reduce((sum, d) => sum + d.consumedMl, 0);
  const avgConsumedMl = Math.round(totalConsumedMl / Math.max(history.length, 1));
  const goalMetCount = history.filter((d) => d.consumedMl >= (d.goalMl || profile.dailyGoalMl)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-blue-950">Weekly Breakdown</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Past 7 days hydration log & consistency</p>
          </div>
        </div>

        {/* Top 3 Stat Cards in Bento Style */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50/70 rounded-2xl p-2.5 text-center border border-blue-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Volume</span>
            <span className="text-sm font-black text-blue-950">
              {(totalConsumedMl / 1000).toFixed(2)} L
            </span>
          </div>
          <div className="bg-blue-50/70 rounded-2xl p-2.5 text-center border border-blue-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Daily Avg</span>
            <span className="text-sm font-black text-blue-600">
              {(avgConsumedMl / 1000).toFixed(2)} L
            </span>
          </div>
          <div className="bg-blue-50/70 rounded-2xl p-2.5 text-center border border-blue-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Goals Met</span>
            <span className="text-sm font-black text-amber-500">
              {goalMetCount}/{history.length}
            </span>
          </div>
        </div>

        {/* Days List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {history.slice(-7).reverse().map((day) => {
            const isGoalMet = day.consumedMl >= (day.goalMl || profile.dailyGoalMl);
            const pct = Math.min(100, Math.round((day.consumedMl / (day.goalMl || profile.dailyGoalMl)) * 100));

            return (
              <div
                key={day.date}
                className="p-3 bg-blue-50/40 rounded-2xl border border-blue-100 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-blue-950">{day.dayLabel}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{day.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <div className="w-20 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isGoalMet ? 'bg-blue-600' : 'bg-blue-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-blue-700">{pct}%</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-blue-950 block">
                    {(day.consumedMl / 1000).toFixed(2)} L
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    of {((day.goalMl || profile.dailyGoalMl) / 1000).toFixed(1)} L
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
