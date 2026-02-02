import {
  calculateSuccessChance,
  calculateFoodGained,
  canHunt,
  hunt,
  getRecommendedAmmo,
  getExpectedFood,
} from '../game/Hunting';

describe('calculateSuccessChance', () => {
  test('returns base chance with 0 ammo', () => {
    expect(calculateSuccessChance(0)).toBeCloseTo(0.3);
  });

  test('increases with more ammo', () => {
    expect(calculateSuccessChance(5)).toBeGreaterThan(calculateSuccessChance(0));
    expect(calculateSuccessChance(10)).toBeGreaterThan(calculateSuccessChance(5));
  });

  test('caps at 70% (due to ammo diminishing returns at 20)', () => {
    // Max bonus is 20 ammo * 0.02 = 0.4, so 0.3 + 0.4 = 0.7
    expect(calculateSuccessChance(100)).toBeCloseTo(0.7);
    expect(calculateSuccessChance(20)).toBeCloseTo(0.7);
  });

  test('more ammo means higher chance', () => {
    const lowAmmo = calculateSuccessChance(5);
    const highAmmo = calculateSuccessChance(15);
    expect(highAmmo).toBeGreaterThan(lowAmmo);
  });
});

describe('calculateFoodGained', () => {
  test('returns value in expected range', () => {
    for (let i = 0; i < 10; i++) {
      const food = calculateFoodGained();
      expect(food).toBeGreaterThanOrEqual(10);
      expect(food).toBeLessThanOrEqual(100);
    }
  });

  test('is deterministic with fixed random', () => {
    const food1 = calculateFoodGained(() => 0.5);
    const food2 = calculateFoodGained(() => 0.5);
    expect(food1).toBe(food2);
  });

  test('returns min with random 0', () => {
    const food = calculateFoodGained(() => 0);
    expect(food).toBe(10);
  });
});

describe('canHunt', () => {
  test('returns true with sufficient ammo', () => {
    expect(canHunt(100, 10)).toBe(true);
  });

  test('returns false with insufficient ammo', () => {
    expect(canHunt(5, 10)).toBe(false);
  });

  test('returns false with 0 ammo to use', () => {
    expect(canHunt(100, 0)).toBe(false);
  });
});

describe('hunt', () => {
  test('fails without enough ammo', () => {
    const result = hunt(10, 5);
    expect(result.ammoUsed).toBe(0);
    expect(result.foodGained).toBe(0);
    expect(result.message).toContain('ammunition');
  });

  test('uses ammo even on failed hunt', () => {
    // Force failure
    const result = hunt(10, 100, () => 0.99);
    expect(result.ammoUsed).toBe(10);
    expect(result.foodGained).toBe(0);
  });

  test('returns food on successful hunt', () => {
    // Force success with low roll
    const result = hunt(10, 100, () => 0.1);
    expect(result.ammoUsed).toBe(10);
    expect(result.foodGained).toBeGreaterThan(0);
  });

  test('more ammo increases success chance', () => {
    // With high roll, low ammo should fail, high ammo succeed
    const lowAmmo = hunt(5, 100, () => 0.65);
    const highAmmo = hunt(20, 100, () => 0.65);

    // At 5 ammo: 30% + 5*2% = 40%, roll 0.65 > 0.40, fail
    // At 20 ammo: 30% + 20*2% = 70%, roll 0.65 < 0.70, success
    expect(lowAmmo.foodGained).toBe(0);
    expect(highAmmo.foodGained).toBeGreaterThan(0);
  });
});

describe('getRecommendedAmmo', () => {
  test('recommends 10% of supply', () => {
    expect(getRecommendedAmmo(100)).toBe(10);
  });

  test('minimum recommendation is 5', () => {
    expect(getRecommendedAmmo(20)).toBe(5);
  });

  test('maximum recommendation is 20', () => {
    expect(getRecommendedAmmo(1000)).toBe(20);
  });

  test('does not exceed current ammo', () => {
    expect(getRecommendedAmmo(3)).toBe(3);
  });
});

describe('getExpectedFood', () => {
  test('returns min, max, and chance', () => {
    const expected = getExpectedFood(10);
    expect(expected.min).toBe(10);
    expect(expected.max).toBe(100);
    expect(expected.chance).toBeGreaterThan(0);
    expect(expected.chance).toBeLessThanOrEqual(100);
  });

  test('chance increases with more ammo', () => {
    const low = getExpectedFood(5);
    const high = getExpectedFood(15);
    expect(high.chance).toBeGreaterThan(low.chance);
  });
});
