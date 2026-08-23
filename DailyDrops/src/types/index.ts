export type AvatarId = 'mint-sprite' | 'blue-sprite' | 'coral-sprite' | 'emerald-sprite' | 'purple-sprite';

export type BeverageType = 'water' | 'lemon-water' | 'tea' | 'electrolyte' | 'sparkling';

export interface WaterLogItem {
  id: string;
  amountMl: number;
  timestamp: string; // ISO string
  beverage: BeverageType;
  note?: string;
}

export interface DayProgress {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  consumedMl: number;
  goalMl: number;
  logs: WaterLogItem[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progressText?: string;
  progressPercent: number;
  category: 'streak' | 'volume' | 'habit' | 'social';
}

export interface ChallengeParticipant {
  id: string;
  name: string;
  avatar: AvatarId;
  color: string;
  consumedL: number;
  goalL: number;
  percentage: number;
  isCurrentUser: boolean;
  lastActive: string;
}

export interface Challenge {
  id: string;
  title: string;
  dateRange: string;
  totalSharedGoalL: number;
  currentSharedL: number;
  participants: ChallengeParticipant[];
  status: 'active' | 'completed';
  milestoneMessage: string;
  inviteCode?: string;
}

export interface UserProfile {
  name: string;
  hasCompletedOnboarding: boolean;
  avatar: AvatarId;
  dailyGoalMl: number;
  wakeTime: string;
  bedTime: string;
  reminderIntervalMinutes: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'ocean-mint' | 'deep-azure' | 'sunset-coral' | 'dark-aqua';
  weightKg?: number;
  activityLevel: 'low' | 'moderate' | 'high';
  activeStartHour?: number;
  activeEndHour?: number;
}

export interface FeedbackSubmission {
  id: string;
  rating: number;
  category: string;
  comment: string;
  submittedAt: string;
  userEmail?: string;
}
