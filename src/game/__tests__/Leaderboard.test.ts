/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'Pioneer',
      score: 5000,
      survived: true,
      partySurvivors: 4,
      distanceTraveled: 2000,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].score).toBe(5000);
  });

  it('should sort by score descending', () => {
    addEntry({ name: 'Low', score: 1000, survived: false, partySurvivors: 0, distanceTraveled: 500, date: '2026-01-01' });
    addEntry({ name: 'High', score: 8000, survived: true, partySurvivors: 5, distanceTraveled: 2500, date: '2026-01-02' });
    addEntry({ name: 'Mid', score: 4000, survived: true, partySurvivors: 2, distanceTraveled: 1800, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `P${i}`, score: i * 500, survived: i > 5, partySurvivors: i % 5, distanceTraveled: i * 200, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', score: 3000, survived: true, partySurvivors: 3, distanceTraveled: 1500, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('caravan-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    addEntry({ name: 'First', score: 6000, survived: true, partySurvivors: 4, distanceTraveled: 2000, date: '2026-01-01' });
    expect(wouldRank(7000)).toBe(1);
    expect(wouldRank(3000)).toBe(2);
  });

  it('should get rank by score', () => {
    addEntry({ name: 'First', score: 6000, survived: true, partySurvivors: 4, distanceTraveled: 2000, date: '2026-01-01' });
    addEntry({ name: 'Second', score: 4000, survived: true, partySurvivors: 2, distanceTraveled: 1500, date: '2026-01-02' });
    expect(getRank(6000)).toBe(1);
    expect(getRank(4000)).toBe(2);
    expect(getRank(9999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', score: 2000, survived: true, partySurvivors: 1, distanceTraveled: 1000, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track survival stats', () => {
    addEntry({ name: 'Survivor', score: 5500, survived: true, partySurvivors: 3, distanceTraveled: 2200, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.survived).toBe(true);
    expect(entry.partySurvivors).toBe(3);
    expect(entry.distanceTraveled).toBe(2200);
  });
});
