import {
  calculateFordRisk,
  calculateCaulkRisk,
  calculateFerryCost,
  canAffordFerry,
  canCaulk,
  ford,
  caulkAndFloat,
  takeFerry,
  wait,
  getCrossingOptions,
} from '../game/River';
import { Supplies, PartyMember } from '../game/types';

// Helper to create supplies
function createSupplies(overrides: Partial<Supplies> = {}): Supplies {
  return {
    food: 200,
    ammunition: 100,
    medicine: 5,
    spareParts: 2,
    money: 400,
    ...overrides,
  };
}

// Helper to create party members
function createParty(): PartyMember[] {
  return [
    { id: 1, name: 'Alice', health: 100, status: 'healthy', sicknessTurns: 0 },
    { id: 2, name: 'Bob', health: 100, status: 'healthy', sicknessTurns: 0 },
    { id: 3, name: 'Carol', health: 100, status: 'healthy', sicknessTurns: 0 },
  ];
}

describe('calculateFordRisk', () => {
  test('returns 10% risk per difficulty level', () => {
    expect(calculateFordRisk(1)).toBeCloseTo(0.1);
    expect(calculateFordRisk(2)).toBeCloseTo(0.2);
    expect(calculateFordRisk(5)).toBeCloseTo(0.5);
  });

  test('caps at 100% risk', () => {
    expect(calculateFordRisk(15)).toBe(1);
  });
});

describe('calculateCaulkRisk', () => {
  test('returns 5% risk per difficulty level', () => {
    expect(calculateCaulkRisk(1)).toBeCloseTo(0.05);
    expect(calculateCaulkRisk(2)).toBeCloseTo(0.1);
    expect(calculateCaulkRisk(5)).toBeCloseTo(0.25);
  });

  test('is less risky than ford', () => {
    for (let d = 1; d <= 5; d++) {
      expect(calculateCaulkRisk(d)).toBeLessThan(calculateFordRisk(d));
    }
  });
});

describe('calculateFerryCost', () => {
  test('returns cost based on difficulty', () => {
    expect(calculateFerryCost(1)).toBe(5);
    expect(calculateFerryCost(3)).toBe(15);
    expect(calculateFerryCost(4)).toBe(20);
  });

  test('caps ferry cost at $20 per spec', () => {
    // Difficulty 5 would be $25 but spec says max $20
    expect(calculateFerryCost(5)).toBe(20);
    expect(calculateFerryCost(10)).toBe(20);
  });
});

describe('canAffordFerry', () => {
  test('returns true when enough money', () => {
    expect(canAffordFerry(100, 3)).toBe(true);
  });

  test('returns false when not enough money', () => {
    expect(canAffordFerry(10, 3)).toBe(false);
  });
});

describe('canCaulk', () => {
  test('returns true with spare parts', () => {
    expect(canCaulk(1)).toBe(true);
    expect(canCaulk(2)).toBe(true);
  });

  test('returns false without spare parts', () => {
    expect(canCaulk(0)).toBe(false);
  });
});

describe('ford', () => {
  test('succeeds when roll beats risk', () => {
    const supplies = createSupplies();
    const party = createParty();
    // Force success with high roll
    const result = ford(1, supplies, party, () => 0.99);
    expect(result.success).toBe(true);
    expect(result.message).toContain('successfully');
  });

  test('fails and loses supplies when roll fails', () => {
    const supplies = createSupplies();
    const party = createParty();
    // Force failure with low roll
    const result = ford(5, supplies, party, () => 0.01);
    expect(result.success).toBe(false);
    expect(result.suppliesLost).toBeDefined();
  });

  test('high difficulty increases failure chance', () => {
    const supplies = createSupplies();
    const party = createParty();
    // At difficulty 5, 50% risk. Roll of 0.4 should fail
    const result = ford(5, supplies, party, () => 0.4);
    expect(result.success).toBe(false);
  });
});

describe('caulkAndFloat', () => {
  test('fails without spare parts', () => {
    const supplies = createSupplies({ spareParts: 0 });
    const party = createParty();
    const result = caulkAndFloat(1, supplies, party);
    expect(result.success).toBe(false);
    expect(result.message).toContain('spare parts');
  });

  test('succeeds and uses spare parts', () => {
    const supplies = createSupplies({ spareParts: 2 });
    const party = createParty();
    const result = caulkAndFloat(1, supplies, party, () => 0.99);
    expect(result.success).toBe(true);
    expect(result.suppliesLost?.spareParts).toBe(1);
  });

  test('uses spare parts even on failure', () => {
    const supplies = createSupplies({ spareParts: 2 });
    const party = createParty();
    const result = caulkAndFloat(5, supplies, party, () => 0.01);
    expect(result.success).toBe(false);
    expect(result.suppliesLost?.spareParts).toBeGreaterThanOrEqual(1);
  });
});

describe('takeFerry', () => {
  test('fails without enough money', () => {
    const result = takeFerry(5, 10);
    expect(result.success).toBe(false);
    expect(result.message).toContain('$20'); // Capped at $20
  });

  test('succeeds and charges money', () => {
    const result = takeFerry(3, 100);
    expect(result.success).toBe(true);
    expect(result.suppliesLost?.money).toBe(15);
  });

  test('is always safe (no random element)', () => {
    const result = takeFerry(5, 100);
    expect(result.success).toBe(true);
    expect(result.suppliesLost?.money).toBe(20); // Capped at $20
  });
});

describe('wait', () => {
  test('reduces difficulty over time', () => {
    const result = wait(5, 3);
    expect(result.newDifficulty).toBeLessThan(5);
    expect(result.daysLost).toBe(3);
  });

  test('cannot reduce below difficulty 1', () => {
    const result = wait(1, 10);
    expect(result.newDifficulty).toBe(1);
  });

  test('defaults to 3 days', () => {
    const result = wait(5);
    expect(result.daysLost).toBe(3);
  });
});

describe('getCrossingOptions', () => {
  test('returns all options with availability', () => {
    const supplies = createSupplies();
    const options = getCrossingOptions(3, supplies);

    expect(options.ford.available).toBe(true);
    expect(options.ford.risk).toBe(30);

    expect(options.caulk.available).toBe(true);
    expect(options.caulk.risk).toBe(15);

    expect(options.ferry.available).toBe(true);
    expect(options.ferry.cost).toBe(15);

    expect(options.wait.available).toBe(true);
    expect(options.wait.daysLost).toBe(3);
  });

  test('disables caulk without spare parts', () => {
    const supplies = createSupplies({ spareParts: 0 });
    const options = getCrossingOptions(3, supplies);
    expect(options.caulk.available).toBe(false);
  });

  test('disables ferry without money', () => {
    const supplies = createSupplies({ money: 5 });
    const options = getCrossingOptions(3, supplies);
    expect(options.ferry.available).toBe(false);
  });

  test('disables wait at difficulty 1', () => {
    const supplies = createSupplies();
    const options = getCrossingOptions(1, supplies);
    expect(options.wait.available).toBe(false);
  });
});
