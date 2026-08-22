import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  DayProgress,
  AchievementBadge,
  Challenge,
  BeverageType,
  WaterLogItem,
} from './types';
import NameOnboarding  from './components/NameOnboarding';
import { storage, getTodayKey, getDayName } from './utils/storage';
import { soundManager } from './utils/audio';
import { StatusBar } from './components/StatusBar';
import { Navigation, TabType } from './components/Navigation';
import { TodayScreen } from './components/TodayScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ChallengesScreen } from './components/ChallengesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AddWaterModal } from './components/AddWaterModal';
import { AchievementsModal } from './components/AchievementsModal';
import { WeeklyDetailsModal } from './components/WeeklyDetailsModal';
import { FeedbackModal } from './components/FeedbackModal';
import { BentoGridDashboard } from './components/BentoGridDashboard';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './utils/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { WaterSprite } from './components/WaterSprite';
import { LayoutGrid, Smartphone, Droplets, BellRing, Grid } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getMyChallenges, addContribution } from './utils/challengeService';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [showOnboarding, setShowOnboarding] = useState(() => !storage.getProfile().hasCompletedOnboarding);
  const [history, setHistory] = useState<DayProgress[]>(() => storage.getHistory());
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshChallenges = () => {
    if (!session) return;
    getMyChallenges(session.user.id).then((rows) => {
      const mapped: Challenge[] = rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        dateRange: '',
        totalSharedGoalL: row.total_goal_l,
        currentSharedL: row.challenge_participants.reduce(
          (sum: number, p: any) => sum + (p.contributed_l || 0),
          0
        ),
        status: 'active',
        milestoneMessage: '',
        inviteCode: row.invite_code,
        participants: row.challenge_participants.map((p: any) => ({
          id: p.user_id,
          name: p.profiles?.name || 'Someone',
          avatar: 'mint-sprite',
          color: p.user_id === session.user.id ? '#14b8a6' : '#3b82f6',
          consumedL: p.contributed_l || 0,
          goalL: row.total_goal_l,
          percentage: Math.round(((p.contributed_l || 0) / row.total_goal_l) * 100),
          isCurrentUser: p.user_id === session.user.id,
          lastActive: '',
        })),
      }));
      setChallenges(mapped);
    });
  };

  useEffect(() => {
    refreshChallenges();
  }, [session]);
  const [achievements, setAchievements] = useState<AchievementBadge[]>(() => storage.getAchievements());
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);

  // Layout view mode: 'bento' (full wide bento layout), 'interactive' (phone frame) or 'side-by-side' (4 screens)
  const [viewMode, setViewMode] = useState<'bento' | 'interactive' | 'side-by-side'>('interactive');

  // Simulated Reminder Toast
  const [reminderToast, setReminderToast] = useState<{ show: boolean; text: string } | null>(null);

  // Sync sound manager setting on start
  useEffect(() => {
    soundManager.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Today progress finder
  const todayKey = getTodayKey();
  const todayIndex = history.findIndex((d) => d.date === todayKey);
  const todayProgress: DayProgress =
    todayIndex >= 0
      ? history[todayIndex]
      : {
          date: todayKey,
          dayLabel: getDayName(todayKey),
          consumedMl: 0,
          goalMl: profile.dailyGoalMl,
          logs: [],
        };
  
  let currentStreak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].consumedMl >= history[i].goalMl) {
      currentStreak++;
    } else {
      break;
    }
  }
    
  // Helper to add water
  const handleAddWater = (amountMl: number, beverage: BeverageType = 'water') => {
    const newLog: WaterLogItem = {
      id: `log-${Date.now()}`,
      amountMl,
      timestamp: new Date().toISOString(),
      beverage,
    };

    const updatedHistory = [...history];
    if (todayIndex >= 0) {
      const current = updatedHistory[todayIndex];
      const newTotal = current.consumedMl + amountMl;
      updatedHistory[todayIndex] = {
        ...current,
        consumedMl: newTotal,
        logs: [...current.logs, newLog],
      };
    } else {
      updatedHistory.push({
        date: todayKey,
        dayLabel: getDayName(todayKey),
        consumedMl: amountMl,
        goalMl: profile.dailyGoalMl,
        logs: [newLog],
      });
    }

    setHistory(updatedHistory);
    storage.saveHistory(updatedHistory);

       // Update shared challenge (real, via Supabase)
    if (session && challenges.length > 0) {
      addContribution(challenges[0].id, session.user.id, amountMl / 1000).then(() => {
        refreshChallenges();
      });
    }

    // Check achievement unlocks
    checkAchievements(amountMl, updatedHistory);
  };

  const handleUndoLast = () => {
    if (todayIndex >= 0 && history[todayIndex].logs.length > 0) {
      const updatedHistory = [...history];
      const current = updatedHistory[todayIndex];
      const removed = current.logs[current.logs.length - 1];
      const newLogs = current.logs.slice(0, -1);
      const newTotal = Math.max(0, current.consumedMl - removed.amountMl);

      updatedHistory[todayIndex] = {
        ...current,
        consumedMl: newTotal,
        logs: newLogs,
      };

      setHistory(updatedHistory);
      storage.saveHistory(updatedHistory);
      soundManager.playWaterDrop();
    }
  };

  const checkAchievements = (newAmountMl: number, currentHist: DayProgress[]) => {
    let changed = false;
    const updated = achievements.map((badge) => {
      if (badge.unlocked) return badge;

      if (badge.id === 'first-drop' && newAmountMl >= 250) {
        changed = true;
        return { ...badge, unlocked: true, unlockedAt: new Date().toISOString(), progressPercent: 100 };
      }

      if (badge.id === 'deep-diver') {
        const todayConsumed = currentHist[todayIndex]?.consumedMl || 0;
        if (todayConsumed >= 2500) {
          changed = true;
          return { ...badge, unlocked: true, unlockedAt: new Date().toISOString(), progressPercent: 100 };
        }
      }

      return badge;
    });

    if (changed) {
      setAchievements(updated);
      storage.saveAchievements(updated);
    }
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleResetData = () => {
    storage.resetAllData();
    window.location.reload();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    storage.resetAllData();
    window.location.reload();
  };

  const triggerSimulatedReminder = () => {
    soundManager.playNudge();
    setReminderToast({
      show: true,
      text: `💧 Time for a sip, ${profile.name}! Keep your streak glowing!`,
    });
    setTimeout(() => {
      setReminderToast(null);
    }, 4500);
  };
   
  if (showOnboarding) {
  return (
    <NameOnboarding
      onComplete={(name) => {
        const updatedProfile = {
          ...profile,
          name,
          hasCompletedOnboarding: true,
        };

        setProfile(updatedProfile);
        storage.saveProfile(updatedProfile);
        setShowOnboarding(false);
      }}
    />
  );
}
   
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Loading...</div>;
  }

  if (!session) {
    return <AuthScreen />;
  }



  return(
    <div className="min-h-screen bg-[#F0F9FF] text-slate-800 font-sans flex flex-col items-center justify-start p-3 sm:p-6 overflow-x-auto selection:bg-blue-100">
     <header className="w-full flex items-center justify-center mb-4 px-4">
  <div className="flex items-center space-x-3">
    <div className="w-11 h-11 rounded-2xl bg-blue-600 shadow-md shadow-blue-500/25 flex items-center justify-center text-white">
      <Droplets className="w-6 h-6 fill-white/80" />
    </div>

    <div>
      <h1 className="text-xl font-black text-blue-950 tracking-tight">
        Daily Drop
      </h1>

      <p className="text-xs text-slate-500 font-medium">
        Your personal hydration companion
      </p>
    </div>
  </div>
</header>

      {/* Reminder Floating Toast */}
      {reminderToast && (
        <div className="fixed top-5 z-50 bg-blue-900/95 backdrop-blur-md text-white border border-blue-400 shadow-2xl px-5 py-3 rounded-2xl flex items-center space-x-3 animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Droplets className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold">{reminderToast.text}</div>
          <button
            onClick={() => {
              handleAddWater(250);
              soundManager.playWaterDrop();
              setReminderToast(null);
            }}
            className="px-2.5 py-1 bg-white text-blue-900 rounded-lg text-xs font-black hover:bg-blue-50 cursor-pointer shadow-xs"
          >
            +250ml
          </button>
        </div>
      )}

      {/* VIEW 1: BENTO GRID DASHBOARD */}
      {viewMode === 'bento' && (
        <BentoGridDashboard
          profile={profile}
          todayProgress={todayProgress}
          history={history}
          currentStreak={currentStreak}
          challenges={challenges}
          achievements={achievements}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onQuickAdd={(ml, bev) => handleAddWater(ml, bev)}
          onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
          onOpenWeeklyModal={() => setIsWeeklyModalOpen(true)}
          onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            setViewMode('interactive');
          }}
        />
      )}

      {/* VIEW 2: ACTUAL APP VIEW */}
{viewMode === 'interactive' && (

  <main className="w-full min-h-screen bg-[#f8fafc] animate-fade-in">

    {/* Actual app content */}
    <div className="w-full min-h-screen flex flex-col overflow-hidden relative">

      {/* Screen Body depending on activeTab */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {activeTab === 'today' && (
          <TodayScreen
            profile={profile}
            todayProgress={todayProgress}
            onQuickAdd={(ml) => handleAddWater(ml)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenReminderSettings={() => setActiveTab('settings')}
            onUndoLast={handleUndoLast}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressScreen
            profile={profile}
            history={history}
            currentStreak={currentStreak}
            achievements={achievements}
            onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
            onOpenWeeklyDetails={() => setIsWeeklyModalOpen(true)}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesScreen
            profile={profile}
            challenges={challenges}
            onUpdateChallenges={(c) => {
              setChallenges(c);
              storage.saveChallenges(c);
            }}
            userId={session?.user.id || ''}
            onRefreshChallenges={refreshChallenges}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            onResetData={handleResetData}
            onSignOut={handleSignOut}
          />
        )}

      </div>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

    </div>

  </main>

)}

      {/* VIEW 3: 4-SCREEN SHOWCASE (Matching all screens styled with Bento aesthetic) */}
      {viewMode === 'side-by-side' && (
        <main className="w-full max-w-7xl py-4 overflow-x-auto animate-fade-in">
          <div className="flex items-start justify-center gap-6 min-w-[1240px] px-4 pb-6">
            {/* Screen 1: Today */}
            <div className="flex flex-col items-center">
              <div className="w-[305px] h-[640px] bg-white p-2.5 rounded-[40px] shadow-xl shadow-blue-200/50 flex flex-col ring-4 ring-blue-100 border border-blue-200">
                <div className="w-full h-full bg-[#f8fafc] rounded-[30px] flex flex-col overflow-hidden relative">
                  <StatusBar />
                  <TodayScreen
                    profile={profile}
                    todayProgress={todayProgress}
                    onQuickAdd={(ml) => handleAddWater(ml)}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onOpenReminderSettings={() => setActiveTab('settings')}
                    onUndoLast={handleUndoLast}
                  />
                  <Navigation activeTab="today" onTabChange={(t) => { setActiveTab(t); setViewMode('interactive'); }} />
                </div>
              </div>
              <span className="text-blue-950 font-black text-sm mt-3 uppercase tracking-wider">Today</span>
            </div>

            {/* Screen 2: Progress */}
            <div className="flex flex-col items-center">
              <div className="w-[305px] h-[640px] bg-white p-2.5 rounded-[40px] shadow-xl shadow-blue-200/50 flex flex-col ring-4 ring-blue-100 border border-blue-200">
                <div className="w-full h-full bg-[#f8fafc] rounded-[30px] flex flex-col overflow-hidden relative">
                  <StatusBar />
                  <ProgressScreen
                    profile={profile}
                    history={history}
                    achievements={achievements}
                    onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
                    onOpenWeeklyDetails={() => setIsWeeklyModalOpen(true)}
                  />
                  <Navigation activeTab="progress" onTabChange={(t) => { setActiveTab(t); setViewMode('interactive'); }} />
                </div>
              </div>
              <span className="text-blue-950 font-black text-sm mt-3 uppercase tracking-wider">Progress</span>
            </div>

            {/* Screen 3: Sip Side by Side */}
            <div className="flex flex-col items-center">
              <div className="w-[305px] h-[640px] bg-white p-2.5 rounded-[40px] shadow-xl shadow-blue-200/50 flex flex-col ring-4 ring-blue-100 border border-blue-200">
                <div className="w-full h-full bg-[#f8fafc] rounded-[30px] flex flex-col overflow-hidden relative">
                  <StatusBar />
                  <ChallengesScreen
                    profile={profile}
                    challenges={challenges}
                    onUpdateChallenges={(c) => {
                      setChallenges(c);
                      storage.saveChallenges(c);
                    }}
                    userId={session?.user.id || ''}
                    onRefreshChallenges={refreshChallenges}
                  />
                  <Navigation activeTab="challenges" onTabChange={(t) => { setActiveTab(t); setViewMode('interactive'); }} />
                </div>
              </div>
              <span className="text-blue-950 font-black text-sm mt-3 uppercase tracking-wider">Sip Side by Side</span>
            </div>

            {/* Screen 4: Add water */}
            <div className="flex flex-col items-center">
              <div className="w-[305px] h-[640px] bg-white p-2.5 rounded-[40px] shadow-xl shadow-blue-200/50 flex flex-col ring-4 ring-blue-100 border border-blue-200">
                <div className="w-full h-full bg-[#f8fafc] rounded-[30px] flex flex-col overflow-hidden relative">
                  <StatusBar />
                  {/* Background dimmed screen */}
                  <div className="opacity-30 pointer-events-none flex-1 flex flex-col">
                    <TodayScreen
                      profile={profile}
                      todayProgress={todayProgress}
                      onQuickAdd={() => {}}
                      onOpenAddModal={() => {}}
                      onOpenReminderSettings={() => {}}
                      onUndoLast={() => {}}
                    />
                  </div>
                  {/* Overlay Add Water Modal Form */}
                  <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[28px] p-4 shadow-2xl border-t border-blue-100">
                    <div className="w-8 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
                    <span className="text-xs font-black text-blue-950 uppercase tracking-wider block mb-2">Choose amount</span>
                    <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                      {[
                        { ml: 250, icon: '💧' },
                        { ml: 500, icon: '🥤' },
                        { ml: 750, icon: '🏺' },
                      ].map((item) => (
                        <div
                          key={item.ml}
                          onClick={() => {
                            handleAddWater(item.ml);
                            soundManager.playWaterDrop();
                          }}
                          className={`p-2 rounded-xl border text-center cursor-pointer ${
                            item.ml === 500
                              ? 'border-blue-500 bg-blue-100 shadow-xs'
                              : 'border-blue-100 bg-blue-50/70 hover:bg-blue-100'
                          }`}
                        >
                          <div className="text-sm">{item.icon}</div>
                          <div className="text-xs font-black text-blue-950">{item.ml} ml</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom amount</div>
                    <div className="p-2 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-slate-400 mb-2 flex items-center justify-between">
                      <span>Enter milliliters</span>
                      <span className="font-bold text-blue-400">ml</span>
                    </div>

                    <div className="bg-blue-50/80 rounded-2xl p-2 border border-blue-100 text-center mb-2">
                      <span className="text-[10px] text-blue-950 block font-bold">Your sprite is doing a tiny victory dance</span>
                      <div className="flex justify-center my-0.5">
                        <WaterSprite avatar={profile.avatar} mood="dancing" size={60} showRipples={false} />
                      </div>
                      <span className="text-[10px] font-bold text-blue-700">One more drop to reach 90%</span>
                    </div>

                    <button
                      onClick={() => {
                        handleAddWater(500);
                        soundManager.playWaterPour();
                      }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-md shadow-blue-500/20"
                    >
                      <Droplets className="w-3.5 h-3.5 fill-white" />
                      <span>Add to today (+500ml)</span>
                    </button>
                  </div>
                </div>
              </div>
              <span className="text-blue-950 font-black text-sm mt-3 uppercase tracking-wider">Add water</span>
            </div>
          </div>
        </main>
      )}

      {/* Modals */}
      <AddWaterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        profile={profile}
        todayProgress={todayProgress}
        onAddWater={handleAddWater}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        achievements={achievements}
      />

      <WeeklyDetailsModal
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        history={history}
        profile={profile}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
