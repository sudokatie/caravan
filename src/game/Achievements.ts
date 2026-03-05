/**
 * Achievement system for Caravan (Oregon Trail)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_hunt', name: 'Hunter', description: 'Complete your first hunt', icon: '🦌', category: 'skill' },
  { id: 'first_trade', name: 'Trader', description: 'Trade at a fort', icon: '🤝', category: 'skill' },
  { id: 'river_cross', name: 'River Crosser', description: 'Successfully cross a river', icon: '🌊', category: 'skill' },
  { id: 'good_hunt', name: 'Sharpshooter', description: 'Bring back 500+ lbs of food', icon: '🎯', category: 'skill' },
  { id: 'cure_disease', name: 'Doctor', description: 'Cure a party member', icon: '💊', category: 'skill' },
  { id: 'oregon', name: 'Pioneer', description: 'Reach Oregon', icon: '🏁', category: 'skill' },

  // Exploration
  { id: 'landmark_5', name: 'Tourist', description: 'Visit 5 landmarks', icon: '🗺️', category: 'exploration' },
  { id: 'all_landmarks', name: 'Explorer', description: 'Visit all landmarks', icon: '🏔️', category: 'exploration' },
  { id: 'shortcut', name: 'Trailblazer', description: 'Take a shortcut', icon: '🛤️', category: 'exploration' },

  // Mastery
  { id: 'all_survive', name: 'Guardian', description: 'Reach Oregon with all party alive', icon: '👨‍👩‍👧‍👦', category: 'mastery' },
  { id: 'wealthy_arrival', name: 'Rich Pioneer', description: 'Arrive with $500+', icon: '💰', category: 'mastery' },
  { id: 'speed_run', name: 'Speed Runner', description: 'Reach Oregon in under 150 days', icon: '⚡', category: 'mastery' },
  { id: 'no_hunt', name: 'Pacifist', description: 'Reach Oregon without hunting', icon: '☮️', category: 'mastery' },
  { id: 'banker', name: 'Banker', description: 'Win as a banker', icon: '🏦', category: 'mastery' },
  { id: 'farmer', name: 'Farmer', description: 'Win as a farmer (hard mode)', icon: '🌾', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Pioneer', description: 'Complete a daily trail', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'caravan_achievements';
const STREAK_KEY = 'caravan_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }

  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }

  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }

  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }
