import {
  getPrice,
  getUnit,
  calculateCost,
  canAfford,
  buy,
  getSellPrice,
  sell,
  getMaxPurchase,
  applyPurchase,
  applySale,
  getStoreInventory,
  StoreItem,
} from '../game/Store';
import { Supplies } from '../game/types';

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

describe('getPrice', () => {
  test('returns correct prices for all items', () => {
    expect(getPrice('food')).toBe(0.2);
    expect(getPrice('ammunition')).toBe(2.0);
    expect(getPrice('medicine')).toBe(5.0);
    expect(getPrice('spareParts')).toBe(10.0);
    expect(getPrice('oxen')).toBe(40.0);
  });
});

describe('getUnit', () => {
  test('returns correct units', () => {
    expect(getUnit('food')).toBe('lb');
    expect(getUnit('ammunition')).toBe('box (20)');
    expect(getUnit('medicine')).toBe('dose');
    expect(getUnit('spareParts')).toBe('set');
    expect(getUnit('oxen')).toBe('ox');
  });
});

describe('calculateCost', () => {
  test('multiplies price by quantity', () => {
    expect(calculateCost('food', 100)).toBe(20);
    expect(calculateCost('ammunition', 5)).toBe(10);
    expect(calculateCost('oxen', 2)).toBe(80);
  });
});

describe('canAfford', () => {
  test('returns true when enough money', () => {
    expect(canAfford(100, 'food', 100)).toBe(true);
  });

  test('returns false when not enough money', () => {
    expect(canAfford(10, 'oxen', 1)).toBe(false);
  });
});

describe('buy', () => {
  test('succeeds with enough money', () => {
    const result = buy('food', 100, 100);
    expect(result.success).toBe(true);
    expect(result.cost).toBe(20);
    expect(result.message).toContain('Purchased');
  });

  test('fails without enough money', () => {
    const result = buy('oxen', 1, 10);
    expect(result.success).toBe(false);
    expect(result.cost).toBe(0);
    expect(result.message).toContain('Not enough');
  });

  test('fails with invalid quantity', () => {
    const result = buy('food', 0, 100);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Invalid');
  });
});

describe('getSellPrice', () => {
  test('returns half of buy price', () => {
    expect(getSellPrice('food')).toBe(0.1);
    expect(getSellPrice('ammunition')).toBe(1.0);
    expect(getSellPrice('oxen')).toBe(20.0);
  });
});

describe('sell', () => {
  test('succeeds with available quantity', () => {
    const result = sell('food', 50, 100);
    expect(result.success).toBe(true);
    expect(result.revenue).toBe(5);
    expect(result.message).toContain('Sold');
  });

  test('fails with insufficient quantity', () => {
    const result = sell('food', 200, 100);
    expect(result.success).toBe(false);
    expect(result.message).toContain('only have');
  });

  test('fails with invalid quantity', () => {
    const result = sell('food', 0, 100);
    expect(result.success).toBe(false);
  });
});

describe('getMaxPurchase', () => {
  test('calculates correct maximum', () => {
    expect(getMaxPurchase(100, 'food')).toBe(500);
    expect(getMaxPurchase(100, 'ammunition')).toBe(50);
    expect(getMaxPurchase(100, 'oxen')).toBe(2);
  });
});

describe('applyPurchase', () => {
  test('deducts money and adds items', () => {
    const supplies = createSupplies({ money: 100, food: 100 });
    const updated = applyPurchase(supplies, 'food', 50);
    expect(updated.money).toBe(90); // 100 - (50 * 0.2)
    expect(updated.food).toBe(150);
  });

  test('ammunition adds 20 per box', () => {
    const supplies = createSupplies({ money: 100, ammunition: 0 });
    const updated = applyPurchase(supplies, 'ammunition', 2);
    expect(updated.ammunition).toBe(40);
    expect(updated.money).toBe(96);
  });

  test('does not mutate original', () => {
    const supplies = createSupplies();
    applyPurchase(supplies, 'food', 10);
    expect(supplies.food).toBe(200);
  });
});

describe('applySale', () => {
  test('adds money and removes items', () => {
    const supplies = createSupplies({ money: 100, food: 100 });
    const updated = applySale(supplies, 'food', 50);
    expect(updated.money).toBe(105); // 100 + (50 * 0.1)
    expect(updated.food).toBe(50);
  });

  test('does not mutate original', () => {
    const supplies = createSupplies();
    applySale(supplies, 'food', 10);
    expect(supplies.food).toBe(200);
  });
});

describe('getStoreInventory', () => {
  test('returns all items with prices and units', () => {
    const inventory = getStoreInventory();
    expect(inventory).toHaveLength(5);

    const food = inventory.find(i => i.item === 'food');
    expect(food).toBeDefined();
    expect(food!.price).toBe(0.2);
    expect(food!.unit).toBe('lb');
  });
});
