import { UserProfile, DayProgress, AchievementBadge, Challenge, FeedbackSubmission, WaterLogItem } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'dailydrop_profile_v1',
  HISTORY: 'dailydrop_history_v1',
  ACHIEVEMENTS: 'dailydrop_achievements_v1',
  CHALLENGES: 'dailydrop_challenges_v1',
  FEEDBACK: 'dailydrop_feedback_v1',
  LAST_LOGIN_DATE: 'dailydrop_last_date_v1',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'You',
  hasCompletedOnboarding: false,
  avatar: 'mint-sprite',
  dailyGoalMl: 2000,
  wakeTime: '07:30',
  bedTime: '23:00',
  reminderIntervalMinutes: 90,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: 'ocean-mint',
  weightKg: 58,
  activityLevel: 'moderate',
};

const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first-drop',
    title: 'First Drop',
    description: 'Log your first 250 ml glass',
    icon: '💧',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'habit',
  },
  {
    id: 'three-day-flow',
    title: 'Three-Day Flow',
    description: 'Meet your daily goal 3 days in a row',
    icon: '3️⃣',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'streak',
  },
  {
    id: 'early-sipper',
    title: 'Early Sipper',
    description: 'Drink a glass before 10:00 AM',
    icon: '🌅',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'habit',
  },
  {
    id: 'seven-day-current',
    title: 'Seven-Day Current',
    description: 'Maintain a 7-day hydration streak',
    icon: '🗓️',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not satrted yet',
    category: 'streak',
  },
  {
    id: 'deep-diver',
    title: 'Deep Diver',
    description: 'Drink 2.5 L or more in a single day',
    icon: '🌊',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'volume',
  },
  {
    id: 'sip-sidekick',
    title: 'Sip Sidekick',
    description: 'Complete a shared challenge with a friend',
    icon: '👯',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'social',
  },
  {
    id: 'night-cap',
    title: 'Evening Calm',
    description: 'Hit exactly 100% before 8:00 PM',
    icon: '🌙',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'habit',
  },
  {
    id: 'master-hydrator',
    title: 'Master Hydrator',
    description: 'Log 50,000 ml of total hydration',
    icon: '👑',
    unlocked: false,
    progressPercent: 0,
    progressText: 'Not started yet',
    category: 'volume',
  },
];

const INITIAL_CHALLENGE: Challenge = {
  id: 'sip-side-by-side',
  title: 'Sip Side by Side',
  dateRange: 'Aug 17–23',
  totalSharedGoalL: 14.0,
  currentSharedL: 12.15,
  status: 'active',
  milestoneMessage: 'A little sip from both of you 💧',
  participants: [
    {
      id: 'p-you',
      name: 'You',
      avatar: 'mint-sprite',
      color: '#14b8a6',
      consumedL: 0,
      goalL: 14.0,
      percentage: 0,
      isCurrentUser: true,
      lastActive: 'just now',
    },
    {
      id: 'p-jordan',
      name: 'Buddy',
      avatar: 'blue-sprite',
      color: '#3b82f6',
      consumedL: 9.4,
      goalL: 14.0,
      percentage: 67,
      isCurrentUser: false,
      lastActive: '34m ago',
    },
  ],
};

export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayName = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getInitialHistory = (): DayProgress[] => {
  const todayStr = getTodayKey();
  const dayLabel = getDayName(todayStr);

  return [
    {
      date: todayStr,
      dayLabel,
      consumedMl: 0,
      goalMl: 2000,
      logs: [],
    },
  ];
};

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  },

  getHistory(): DayProgress[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        const parsed: DayProgress[] = JSON.parse(data);
        const todayStr = getTodayKey();
        // Check if today exists in history, if not add it
        const todayExists = parsed.some(d => d.date === todayStr);
        if (!todayExists) {
          parsed.push({
            date: todayStr,
            dayLabel: getDayName(todayStr),
            consumedMl: 0, // Initial matching image
            goalMl: 2000,
            logs: [],
          });
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed));
        }
        return parsed;
      }
      const initial = getInitialHistory();
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(initial));
      return initial;
    } catch {
      return getInitialHistory();
    }
  },

  saveHistory(history: DayProgress[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  },

  getAchievements(): AchievementBadge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },

  saveAchievements(badges: AchievementBadge[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(badges));
    } catch (e) {
      console.error(e);
    }
  },

  getChallenges(): Challenge[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChallenges(challenges: Challenge[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
    } catch (e) {
      console.error(e);
    }
  },

  getFeedbackList(): FeedbackSubmission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFeedback(item: FeedbackSubmission) {
    try {
      const list = this.getFeedbackList();
      list.unshift(item);
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
  }
};
