import {
  calculateDailyDistance,
  advanceDay,
  travelOneDay,
  canContinue,
  getDistanceRemaining,
  getDistanceToNextLocation,
  estimateDaysToNext,
  DateState,
} from '../game/Travel';
import { PaceType, WeatherType, Wagon, PartyMember, Supplies } from '../game/types';

// Helper to create a default wagon
function createWagon(condition = 100, oxen = 2): Wagon {
  return { condition, oxen };
}

// Helper to create a party member
function createMember(id: number, status: 'healthy' | 'dead' = 'healthy'): PartyMember {
  return { id, name: `Member ${id}`, health: 100, status, sicknessTurns: 0 };
}

// Helper to create supplies
function createSupplies(food = 200): Supplies {
  return { food, ammunition: 100, medicine: 5, spareParts: 2, money: 400 };
}

describe('calculateDailyDistance', () => {
  test('returns base pace speed with minimum oxen', () => {
    // With 1 oxen (minimum), no speed bonus
    const wagon = createWagon(100, 1);
    expect(calculateDailyDistance(PaceType.Steady, WeatherType.Clear, wagon)).toBe(15);
    expect(calculateDailyDistance(PaceType.Strenuous, WeatherType.Clear, wagon)).toBe(20);
    expect(calculateDailyDistance(PaceType.Grueling, WeatherType.Clear, wagon)).toBe(25);
  });

  test('returns 0 during blizzard', () => {
    const wagon = createWagon();
    expect(calculateDailyDistance(PaceType.Steady, WeatherType.Blizzard, wagon)).toBe(0);
    expect(calculateDailyDistance(PaceType.Grueling, WeatherType.Blizzard, wagon)).toBe(0);
  });

  test('reduces distance in bad weather', () => {
    const wagon = createWagon();
    const clear = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, wagon);
    const rain = calculateDailyDistance(PaceType.Steady, WeatherType.Rain, wagon);
    const storm = calculateDailyDistance(PaceType.Steady, WeatherType.Storm, wagon);
    const snow = calculateDailyDistance(PaceType.Steady, WeatherType.Snow, wagon);

    expect(rain).toBeLessThan(clear);
    expect(storm).toBeLessThan(rain);
    expect(snow).toBeLessThan(storm);
  });

  test('extra oxen increase distance', () => {
    const twoOxen = createWagon(100, 2);
    const fourOxen = createWagon(100, 4);

    const distTwo = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, twoOxen);
    const distFour = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, fourOxen);

    expect(distFour).toBeGreaterThan(distTwo);
  });

  test('broken wagon reduces speed', () => {
    const good = createWagon(100, 2);
    const damaged = createWagon(40, 2);
    const broken = createWagon(0, 2);

    const distGood = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, good);
    const distDamaged = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, damaged);
    const distBroken = calculateDailyDistance(PaceType.Steady, WeatherType.Clear, broken);

    expect(distDamaged).toBeLessThan(distGood);
    expect(distBroken).toBeLessThan(distDamaged);
  });

  test('never returns negative distance', () => {
    const wagon = createWagon(0, 1);
    const dist = calculateDailyDistance(PaceType.Steady, WeatherType.Snow, wagon);
    expect(dist).toBeGreaterThanOrEqual(0);
  });
});

describe('advanceDay', () => {
  test('increments day within month', () => {
    const date: DateState = { day: 15, month: 4, year: 1848 };
    const newDate = advanceDay(date);
    expect(newDate.day).toBe(16);
    expect(newDate.month).toBe(4);
    expect(newDate.year).toBe(1848);
  });

  test('advances to next month at month end', () => {
    const date: DateState = { day: 30, month: 4, year: 1848 };
    const newDate = advanceDay(date);
    expect(newDate.day).toBe(1);
    expect(newDate.month).toBe(5);
    expect(newDate.year).toBe(1848);
  });

  test('advances to next year at year end', () => {
    const date: DateState = { day: 31, month: 12, year: 1848 };
    const newDate = advanceDay(date);
    expect(newDate.day).toBe(1);
    expect(newDate.month).toBe(1);
    expect(newDate.year).toBe(1849);
  });

  test('handles February correctly', () => {
    const date: DateState = { day: 28, month: 2, year: 1848 };
    const newDate = advanceDay(date);
    expect(newDate.day).toBe(1);
    expect(newDate.month).toBe(3);
  });

  test('does not mutate original date', () => {
    const date: DateState = { day: 15, month: 4, year: 1848 };
    advanceDay(date);
    expect(date.day).toBe(15);
  });
});

describe('travelOneDay', () => {
  test('increases distance traveled', () => {
    const wagon = createWagon(100, 1); // 1 oxen = base speed
    const result = travelOneDay(0, 0, PaceType.Steady, WeatherType.Clear, wagon);
    expect(result.distanceTraveled).toBe(15);
    expect(result.newTotalDistance).toBe(15);
  });

  test('detects when location is reached', () => {
    const wagon = createWagon();
    // First location after start is Kansas River at 102 miles
    const result = travelOneDay(100, 0, PaceType.Steady, WeatherType.Clear, wagon);
    expect(result.reachedLocation).not.toBeNull();
    expect(result.reachedLocation?.id).toBe('kansas_river');
    expect(result.newLocationIndex).toBe(1);
  });

  test('does not advance location if not reached', () => {
    const wagon = createWagon();
    const result = travelOneDay(50, 0, PaceType.Steady, WeatherType.Clear, wagon);
    expect(result.reachedLocation).toBeNull();
    expect(result.newLocationIndex).toBe(0);
  });
});

describe('canContinue', () => {
  test('allows travel with healthy party', () => {
    const party = [createMember(1), createMember(2)];
    const supplies = createSupplies();
    const wagon = createWagon();
    const result = canContinue(party, supplies, wagon, 0);
    expect(result.canTravel).toBe(true);
    expect(result.reason).toBeNull();
  });

  test('prevents travel when all dead', () => {
    const party = [createMember(1, 'dead'), createMember(2, 'dead')];
    const supplies = createSupplies();
    const wagon = createWagon();
    const result = canContinue(party, supplies, wagon, 0);
    expect(result.canTravel).toBe(false);
    expect(result.reason).toContain('died');
  });

  test('prevents travel with no oxen', () => {
    const party = [createMember(1)];
    const supplies = createSupplies();
    const wagon = createWagon(100, 0);
    const result = canContinue(party, supplies, wagon, 0);
    expect(result.canTravel).toBe(false);
    expect(result.reason).toContain('oxen');
  });

  test('stops at destination', () => {
    const party = [createMember(1)];
    const supplies = createSupplies();
    const wagon = createWagon();
    // Oregon City is index 16
    const result = canContinue(party, supplies, wagon, 16);
    expect(result.canTravel).toBe(false);
    expect(result.reason).toContain('destination');
  });

  test('allows travel with no food (will starve)', () => {
    const party = [createMember(1)];
    const supplies = createSupplies(0);
    const wagon = createWagon();
    const result = canContinue(party, supplies, wagon, 0);
    expect(result.canTravel).toBe(true);
  });
});

describe('getDistanceRemaining', () => {
  test('returns full distance at start', () => {
    expect(getDistanceRemaining(0)).toBe(2000);
  });

  test('returns correct distance mid-journey', () => {
    expect(getDistanceRemaining(1000)).toBe(1000);
  });

  test('returns 0 at destination', () => {
    expect(getDistanceRemaining(2000)).toBe(0);
  });

  test('never returns negative', () => {
    expect(getDistanceRemaining(3000)).toBe(0);
  });
});

describe('getDistanceToNextLocation', () => {
  test('returns distance to first landmark', () => {
    // From Independence (0), next is Kansas River at 102
    expect(getDistanceToNextLocation(0, 0)).toBe(102);
  });

  test('accounts for distance already traveled', () => {
    expect(getDistanceToNextLocation(0, 50)).toBe(52);
  });
});

describe('estimateDaysToNext', () => {
  test('estimates days based on pace', () => {
    const wagon = createWagon(100, 1); // 1 oxen = base speed
    // 102 miles at 15/day = 7 days
    const days = estimateDaysToNext(0, 0, PaceType.Steady, wagon);
    expect(days).toBe(7);
  });

  test('faster pace means fewer days', () => {
    const wagon = createWagon(100, 1);
    const steadyDays = estimateDaysToNext(0, 0, PaceType.Steady, wagon);
    const gruelingDays = estimateDaysToNext(0, 0, PaceType.Grueling, wagon);
    expect(gruelingDays).toBeLessThan(steadyDays);
  });

  test('more oxen means fewer days', () => {
    const slowWagon = createWagon(100, 1);
    const fastWagon = createWagon(100, 4);
    const slowDays = estimateDaysToNext(0, 0, PaceType.Steady, slowWagon);
    const fastDays = estimateDaysToNext(0, 0, PaceType.Steady, fastWagon);
    expect(fastDays).toBeLessThan(slowDays);
  });
});
