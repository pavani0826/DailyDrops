import React, { useState } from 'react';
import { UserProfile, AvatarId } from '../types';
import { WaterSprite } from './WaterSprite';
import {
  Bell,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  MessageSquare,
  Moon,
  Sun,
  User,
  Calculator,
  RefreshCw,
  Check,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onOpenFeedback: () => void;
  onResetData: () => void;
  onSignOut: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpenFeedback,
  onResetData,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.name);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalMl);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(profile.avatar);
  const [reminderInterval, setReminderInterval] = useState(profile.reminderIntervalMinutes);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);
  const [theme, setTheme] = useState(profile.theme);
  const [savedNotice, setSavedNotice] = useState(false);

  // Calculator state
  const [weightKg, setWeightKg] = useState(profile.weightKg || 60);
  const [activity, setActivity] = useState<'low' | 'moderate' | 'high'>(profile.activityLevel || 'moderate');
  const [showCalculator, setShowCalculator] = useState(false);

  const avatars: { id: AvatarId; name: string; color: string }[] = [
    { id: 'mint-sprite', name: 'Mint Droplet', color: '#14b8a6' },
    { id: 'blue-sprite', name: 'Azure Ocean', color: '#3b82f6' },
    { id: 'coral-sprite', name: 'Coral Splash', color: '#f43f5e' },
    { id: 'emerald-sprite', name: 'Emerald Dew', color: '#10b981' },
    { id: 'purple-sprite', name: 'Lilac Wave', color: '#a855f7' },
  ];

  const calculateRecommendedGoal = (w: number, act: 'low' | 'moderate' | 'high') => {
    // Base 35ml per kg of body weight + activity bonus
    const base = w * 35;
    const bonus = act === 'low' ? 0 : act === 'moderate' ? 350 : 700;
    return Math.round((base + bonus) / 50) * 50;
  };

    const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name,
      avatar: selectedAvatar,
      dailyGoalMl: dailyGoal,
      reminderIntervalMinutes: reminderInterval,
      soundEnabled,
      notificationsEnabled,
      theme,
      weightKg,
      activityLevel: activity,
    };
    soundManager.setEnabled(soundEnabled);
    onUpdateProfile(updated);
    setSavedNotice(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

    const showNotification = (title: string, body: string) => {
    if (typeof Notification === 'undefined') return;
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
      });
    });
  };

  const handleTestReminder = () => {
    soundManager.playNudge();
    if (Notification.permission === 'granted') {
      showNotification('Daily Drop Hydration Reminder 💧', `Time for a refreshing glass of water, ${name}! Your sprite is cheering for you.`);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showNotification('Daily Drop Reminders Active! 💧', `We'll keep you hydrated throughout the day, ${name}!`);
        }
      });
    }
  };
  return (
    <div className="flex-1 flex flex-col px-5 pt-3 pb-6 select-none overflow-y-auto max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-black text-blue-950">Settings</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personalize your Daily Drop experience</p>
        </div>
        {savedNotice && (
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200 animate-fade-in flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      {/* Avatar & Name Card (Bento Tile) */}
      <div className="bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40 mb-3.5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Profile & Sprite Avatar</span>
        </h2>

        {/* Current Avatar Big Preview */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-2 bg-blue-50 rounded-2xl border border-blue-100">
            <WaterSprite avatar={selectedAvatar} mood="cheering" size={75} showRipples={false} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-sm font-black text-blue-950 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Avatar Options Picker */}
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Choose Avatar</label>
        <div className="grid grid-cols-5 gap-2">
          {avatars.map((av) => (
            <button
              key={av.id}
              onClick={() => {
                setSelectedAvatar(av.id);
                soundManager.playWaterDrop();
              }}
              className={`p-1.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedAvatar === av.id
                  ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-400'
                  : 'border-blue-50 bg-blue-50/40 hover:bg-blue-50'
              }`}
            >
              <WaterSprite avatar={av.id} size={42} showRipples={false} />
              <span className="text-[9px] font-bold text-blue-950 mt-1 truncate max-w-full">
                {av.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Water Goal Setting (Bento Tile) */}
      <div className="bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40 mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>Daily Hydration Target</span>
          </h2>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-[11px] text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Calculator className="w-3 h-3" />
            <span>Smart Calculator</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-2">
          <input
            type="range"
            min="1000"
            max="4000"
            step="100"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="flex-1 accent-blue-600 h-2 bg-blue-100 rounded-lg cursor-pointer"
          />
          <span className="font-black text-sm text-blue-950 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 min-w-[75px] text-center">
            {dailyGoal} ml
          </span>
        </div>

        {/* Quick Goal Presets */}
        <div className="flex items-center space-x-2 pt-1">
          {[1500, 2000, 2500, 3000].map((preset) => (
            <button
              key={preset}
              onClick={() => setDailyGoal(preset)}
              className={`flex-1 py-1 text-xs rounded-xl font-bold border transition-colors cursor-pointer ${
                dailyGoal === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 text-blue-900 border-blue-100 hover:bg-blue-100'
              }`}
            >
              {preset / 1000}L
            </button>
          ))}
        </div>

        {/* Smart Calculator Expansion */}
        {showCalculator && (
          <div className="mt-3 p-3 bg-blue-50/80 rounded-2xl border border-blue-100 animate-fade-in text-xs">
            <div className="font-black text-blue-950 mb-2">Personalized Recommendation</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Weight (kg)</span>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2.5 py-1 bg-white border border-blue-200 rounded-lg font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Daily Activity</span>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as 'low' | 'moderate' | 'high')}
                  className="w-full px-2 py-1 bg-white border border-blue-200 rounded-lg font-bold text-xs"
                >
                  <option value="low">Low (Desk Work)</option>
                  <option value="moderate">Moderate (Walking)</option>
                  <option value="high">High (Sports/Gym)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                const rec = calculateRecommendedGoal(weightKg, activity);
                setDailyGoal(rec);
                setShowCalculator(false);
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              Apply Recommended: {calculateRecommendedGoal(weightKg, activity)} ml
            </button>
          </div>
        )}
      </div>

      {/* Reminder & Audio Settings */}
      <div className="bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40 mb-3.5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <span>Reminders & Audio</span>
        </h2>

        <div className="space-y-3">
          {/* Interval Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-bold">Reminder Interval</span>
            <select
              value={reminderInterval}
              onChange={(e) => setReminderInterval(Number(e.target.value))}
              className="text-xs bg-blue-50 border border-blue-200 rounded-xl px-2.5 py-1 font-bold text-blue-950 focus:outline-none"
            >
              <option value="1">Every 1 min</option>
              <option value="2">Every 2 mins</option>
              <option value="5">Every 5 mins</option>
              <option value="45">Every 45 mins</option>
              <option value="60">Every 1 hour</option>
              <option value="90">Every 90 mins (Default)</option>
              <option value="120">Every 2 hours</option>
            </select>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs text-slate-700 font-bold">Hydration Sound Effects</span>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                soundManager.setEnabled(next);
                if (next) soundManager.playWaterDrop();
              }}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                soundEnabled ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Test reminder trigger */}
          <button
            onClick={handleTestReminder}
            className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Test a Water Reminder</span>
          </button>
        </div>
      </div>

      {/* Community & Feedback Mechanism Card */}
      <div className="bg-white rounded-[2rem] p-4 border border-blue-100 shadow-md shadow-blue-100/40 mb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Feedback & Support</span>
        </h2>
        <p className="text-[11px] text-slate-400 mb-3">
          Help us improve Daily Drop with your feature requests, bugs, or reviews.
        </p>
        <button
          onClick={onOpenFeedback}
          className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send Feedback & Suggestions</span>
        </button>
      </div>

      {/* Save Settings Button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20 mb-3 active:scale-98"
      >
        <Check className="w-4 h-4 stroke-[3]" />
        <span>Save Changes</span>
      </button>

      {/* Reset Demo Button */}
      <button
        onClick={() => {
          if (confirm('Reset demo data to initial defaults?')) {
            onResetData();
          }
        }}
        className="w-full py-2 text-slate-400 hover:text-rose-500 text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Reset to Default Data</span>
      </button>

       {/* Sign Out Button */}
      <button
        onClick={() => {
          if (confirm('Sign out of your account?')) {
            onSignOut();
          }
        }}
        className="w-full py-2 mt-1 text-slate-400 hover:text-rose-500 text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
      >
        <span>Sign Out</span>
      </button>

    </div>
  );
};
