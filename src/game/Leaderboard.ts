// Leaderboard for Caravan - tracks trail survivors

const STORAGE_KEY = 'caravan-leaderboard';
const MAX_ENTRIES = 10;

export interface LeaderboardEntry {
  name: string;
  score: number;
  survived: boolean;
  partySurvivors: number;
  distanceTraveled: number;
  date: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function addEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const entries = getLeaderboard();
  entries.push(entry);
  
  // Sort by score (descending), then by survivors
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.partySurvivors - a.partySurvivors;
  });
  
  // Keep top N
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

export function getTop(n: number = MAX_ENTRIES): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n);
}

export function wouldRank(score: number): number | null {
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) {
    const position = entries.findIndex(e => score > e.score);
    return position === -1 ? entries.length + 1 : position + 1;
  }
  
  const position = entries.findIndex(e => score > e.score);
  if (position === -1) return null;
  return position + 1;
}

export function getRank(score: number): number | null {
  const entries = getLeaderboard();
  const position = entries.findIndex(e => e.score === score);
  return position === -1 ? null : position + 1;
}

export function clearLeaderboard(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Calculate score from game results
export function calculateScore(
  survived: boolean,
  partySurvivors: number,
  distanceTraveled: number,
  daysOnTrail: number
): number {
  let score = 0;
  
  // Base score for distance
  score += distanceTraveled;
  
  // Bonus for reaching destination
  if (survived) {
    score += 1000;
  }
  
  // Bonus per survivor (max 5 party members)
  score += partySurvivors * 200;
  
  // Time bonus (faster = more points, max 180 days)
  if (survived && daysOnTrail < 180) {
    score += (180 - daysOnTrail) * 5;
  }
  
  return score;
}
