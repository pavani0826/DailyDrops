import React, { useState } from 'react';
import { UserProfile, DayProgress, BeverageType } from '../types';
import { WaterSprite } from './WaterSprite';
import { Droplet, X, Sparkles, Check, Coffee, Citrus, Zap } from 'lucide-react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';

interface AddWaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  todayProgress: DayProgress;
  onAddWater: (amountMl: number, beverage: BeverageType) => void;
}

export const AddWaterModal: React.FC<AddWaterModalProps> = ({
  isOpen,
  onClose,
  profile,
  todayProgress,
  onAddWater,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customInput, setCustomInput] = useState<string>('');
  const [selectedBeverage, setSelectedBeverage] = useState<BeverageType>('water');

  if (!isOpen) return null;

  const currentMl = todayProgress.consumedMl;
  const goalMl = todayProgress.goalMl || profile.dailyGoalMl;

  // Active amount calculation
  const effectiveAmount = customInput && Number(customInput) > 0 ? Number(customInput) : selectedAmount;
  const projectedTotal = currentMl + effectiveAmount;
  const projectedPercentage = Math.min(Math.round((projectedTotal / goalMl) * 100), 100);

  // Remaining milliliters after this drop
  const remainingMl = Math.max(0, goalMl - projectedTotal);

  const getEncouragement = () => {
    if (projectedTotal >= goalMl) {
      return "This drop will crush your daily goal! 🎉";
    }
    if (projectedPercentage >= 85) {
      return `One more drop to reach ${projectedPercentage}%!`;
    }
    return `You'll reach ${projectedPercentage}% of today's target!`;
  };

  const handleConfirm = () => {
    if (effectiveAmount <= 0) return;

    soundManager.playWaterPour();

    if (projectedTotal >= goalMl && currentMl < goalMl) {
      // Goal achieved celebration!
      soundManager.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#0ea5e9', '#14b8a6', '#f59e0b', '#3b82f6'],
      });
    }

    onAddWater(effectiveAmount, selectedBeverage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Card */}
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-5 pb-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto border border-slate-100 animate-slide-up">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-blue-950 uppercase tracking-wider">Choose amount</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Amount Cards (250 ml, 500 ml, 750 ml in Bento style) */}
        <div className="grid grid-cols-3 gap-2.5 mb-3.5">
          {[
            { ml: 250, label: 'Small glass', tier: 'bg-blue-50/90 hover:bg-blue-100', icon: '💧' },
            { ml: 500, label: 'Standard', tier: 'bg-blue-100/80 hover:bg-blue-200', icon: '🥤' },
            { ml: 750, label: 'Water bottle', tier: 'bg-blue-200/70 hover:bg-blue-300', icon: '🏺' },
          ].map((item) => {
            const isSelected = selectedAmount === item.ml && !customInput;
            return (
              <button
                key={item.ml}
                onClick={() => {
                  setSelectedAmount(item.ml);
                  setCustomInput('');
                  soundManager.playWaterDrop();
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-100 shadow-sm ring-2 ring-blue-400'
                    : `border-blue-100 ${item.tier} text-blue-950`
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="font-black text-xs sm:text-sm text-blue-950">{item.ml} ml</span>
                <span className="text-[10px] text-slate-400 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-3.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Custom amount</label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-blue-500">
              <Droplet className="w-4 h-4 fill-blue-200 text-blue-600" />
            </div>
            <input
              type="number"
              min="10"
              max="3000"
              step="50"
              placeholder="Enter milliliters"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs sm:text-sm font-bold text-blue-950 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <span className="absolute right-3.5 text-xs text-blue-400 font-bold">ml</span>
          </div>
        </div>

        {/* Beverage Type Selection */}
        <div className="mb-3.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Drink Type</label>
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {[
              { id: 'water' as BeverageType, label: 'Pure Water', icon: '💧' },
              { id: 'lemon-water' as BeverageType, label: 'Lemon Water', icon: '🍋' },
              { id: 'tea' as BeverageType, label: 'Herbal Tea', icon: '🍵' },
              { id: 'electrolyte' as BeverageType, label: 'Electrolyte', icon: '⚡' },
              { id: 'sparkling' as BeverageType, label: 'Sparkling', icon: '🫧' },
            ].map((bev) => (
              <button
                key={bev.id}
                onClick={() => setSelectedBeverage(bev.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 flex-shrink-0 cursor-pointer transition-colors ${
                  selectedBeverage === bev.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                <span>{bev.icon}</span>
                <span>{bev.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* After this drop preview card */}
        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mini Circular Ring */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-8 h-8 transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#dbeafe" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * projectedPercentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">After this drop</span>
              <span className="text-xs sm:text-sm font-black text-blue-950">
                {projectedTotal.toLocaleString()} ml{' '}
                <span className="text-slate-400 font-semibold text-xs">of {goalMl.toLocaleString()} ml</span>
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-xs">
            {projectedPercentage}%
          </span>
        </div>

        {/* Interactive Sprite State Card (matching Screen 4) */}
        <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-100 mb-4 flex flex-col items-center text-center">
          <span className="text-xs font-bold text-blue-950 mb-0.5">
            Your sprite is doing a tiny victory dance
          </span>

          <WaterSprite avatar={profile.avatar} mood="dancing" size={100} showRipples={true} />

          <span className="text-xs font-bold text-blue-700 mt-1">{getEncouragement()}</span>
        </div>

        {/* Primary CTA Button: "Add to today" */}
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
        >
          <Droplet className="w-4 h-4 fill-white" />
          <span>Add to today (+{effectiveAmount} ml)</span>
        </button>
      </div>
    </div>
  );
};
