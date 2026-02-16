// Tests for Caravan leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  calculateScore,
  LeaderboardEntry,
} from '../game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'Pioneer',
        score: 3500,
        survived: true,
        partySurvivors: 4,
        distanceTraveled: 2000,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('Pioneer');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Settler',
        score: 2500,
        survived: true,
        partySurvivors: 3,
        distanceTraveled: 1800,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(2500);
    });

    it('sorts entries by score descending', () => {
      addEntry({ name: 'Low', score: 1000, survived: false, partySurvivors: 0, distanceTraveled: 500, date: '2026-02-16' });
      addEntry({ name: 'High', score: 4000, survived: true, partySurvivors: 5, distanceTraveled: 2000, date: '2026-02-16' });
      addEntry({ name: 'Mid', score: 2500, survived: true, partySurvivors: 2, distanceTraveled: 1500, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('High');
      expect(entries[1].name).toBe('Mid');
      expect(entries[2].name).toBe('Low');
    });

    it('sorts by survivors when scores equal', () => {
      addEntry({ name: 'FewSurvive', score: 2000, survived: true, partySurvivors: 2, distanceTraveled: 1000, date: '2026-02-16' });
      addEntry({ name: 'AllSurvive', score: 2000, survived: true, partySurvivors: 5, distanceTraveled: 1000, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('AllSurvive');
      expect(entries[1].name).toBe('FewSurvive');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Pioneer${i}`,
          score: i * 500,
          survived: i > 5,
          partySurvivors: i % 5,
          distanceTraveled: i * 200,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Pioneer${i}`,
          score: (i + 1) * 1000,
          survived: true,
          partySurvivors: 5,
          distanceTraveled: 2000,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].score).toBe(5000);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', score: 2000, survived: true, partySurvivors: 3, distanceTraveled: 1000, date: '2026-02-16' });
      expect(wouldRank(3000)).toBe(1);
      expect(wouldRank(1000)).toBe(2);
    });

    it('returns null when would not rank on full board', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Pioneer${i}`,
          score: (i + 1) * 500,
          survived: true,
          partySurvivors: 3,
          distanceTraveled: 1000,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(100)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing score', () => {
      addEntry({ name: 'First', score: 4000, survived: true, partySurvivors: 5, distanceTraveled: 2000, date: '2026-02-16' });
      addEntry({ name: 'Second', score: 2000, survived: true, partySurvivors: 3, distanceTraveled: 1500, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(getRank(entries[0].score)).toBe(1);
      expect(getRank(entries[1].score)).toBe(2);
    });

    it('returns null for non-existent score', () => {
      addEntry({ name: 'Test', score: 2000, survived: true, partySurvivors: 3, distanceTraveled: 1000, date: '2026-02-16' });
      expect(getRank(5000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', score: 2000, survived: true, partySurvivors: 3, distanceTraveled: 1000, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('calculates base score from distance', () => {
      const score = calculateScore(false, 0, 1000, 100);
      expect(score).toBe(1000); // just distance
    });

    it('adds bonus for surviving', () => {
      const score = calculateScore(true, 0, 1000, 200);
      expect(score).toBe(2000); // 1000 distance + 1000 survival
    });

    it('adds bonus per survivor', () => {
      const score = calculateScore(true, 5, 1000, 200);
      expect(score).toBe(3000); // 1000 + 1000 + (5 * 200)
    });

    it('adds time bonus for fast completion', () => {
      const score = calculateScore(true, 5, 1000, 100);
      expect(score).toBe(3400); // 1000 + 1000 + 1000 + (80 * 5)
    });

    it('no time bonus when over 180 days', () => {
      const score = calculateScore(true, 3, 1500, 200);
      expect(score).toBe(3100); // 1500 + 1000 + 600, no time bonus
    });
  });
});
