import {
  createSupplies,
  createEmptySupplies,
  consumeFood,
  useAmmo,
  useMedicine,
  useParts,
  spendMoney,
  addSupplies,
  hasEnough,
  getDailyFoodNeed,
  canFeedParty,
  feedParty,
  getSupplyValue,
  cloneSupplies,
} from '../game/Supplies';
import { RationsType } from '../game/types';
import {
  STARTING_FOOD,
  STARTING_AMMO,
  STARTING_MEDICINE,
  STARTING_PARTS,
  STARTING_MONEY,
} from '../game/constants';

describe('Supplies', () => {
  describe('createSupplies', () => {
    it('creates supplies with starting values', () => {
      const supplies = createSupplies();
      expect(supplies.food).toBe(STARTING_FOOD);
      expect(supplies.ammunition).toBe(STARTING_AMMO);
      expect(supplies.medicine).toBe(STARTING_MEDICINE);
      expect(supplies.spareParts).toBe(STARTING_PARTS);
      expect(supplies.money).toBe(STARTING_MONEY);
    });
  });

  describe('createEmptySupplies', () => {
    it('creates empty supplies', () => {
      const supplies = createEmptySupplies();
      expect(supplies.food).toBe(0);
      expect(supplies.ammunition).toBe(0);
      expect(supplies.medicine).toBe(0);
      expect(supplies.spareParts).toBe(0);
      expect(supplies.money).toBe(0);
    });
  });

  describe('consumeFood', () => {
    it('reduces food when enough available', () => {
      const supplies = createSupplies();
      const result = consumeFood(supplies, 50);
      expect(result).toBe(true);
      expect(supplies.food).toBe(STARTING_FOOD - 50);
    });

    it('returns false when not enough food', () => {
      const supplies = createEmptySupplies();
      supplies.food = 20;
      const result = consumeFood(supplies, 50);
      expect(result).toBe(false);
      expect(supplies.food).toBe(20);
    });
  });

  describe('useAmmo', () => {
    it('reduces ammo when enough available', () => {
      const supplies = createSupplies();
      const result = useAmmo(supplies, 10);
      expect(result).toBe(true);
      expect(supplies.ammunition).toBe(STARTING_AMMO - 10);
    });

    it('returns false when not enough ammo', () => {
      const supplies = createEmptySupplies();
      const result = useAmmo(supplies, 10);
      expect(result).toBe(false);
    });
  });

  describe('useMedicine', () => {
    it('uses one medicine', () => {
      const supplies = createSupplies();
      const result = useMedicine(supplies);
      expect(result).toBe(true);
      expect(supplies.medicine).toBe(STARTING_MEDICINE - 1);
    });

    it('returns false when no medicine', () => {
      const supplies = createEmptySupplies();
      const result = useMedicine(supplies);
      expect(result).toBe(false);
    });
  });

  describe('useParts', () => {
    it('uses one part', () => {
      const supplies = createSupplies();
      const result = useParts(supplies);
      expect(result).toBe(true);
      expect(supplies.spareParts).toBe(STARTING_PARTS - 1);
    });

    it('returns false when no parts', () => {
      const supplies = createEmptySupplies();
      const result = useParts(supplies);
      expect(result).toBe(false);
    });
  });

  describe('spendMoney', () => {
    it('spends money when enough available', () => {
      const supplies = createSupplies();
      const result = spendMoney(supplies, 100);
      expect(result).toBe(true);
      expect(supplies.money).toBe(STARTING_MONEY - 100);
    });

    it('returns false when not enough money', () => {
      const supplies = createEmptySupplies();
      supplies.money = 50;
      const result = spendMoney(supplies, 100);
      expect(result).toBe(false);
      expect(supplies.money).toBe(50);
    });
  });

  describe('addSupplies', () => {
    it('adds to food', () => {
      const supplies = createEmptySupplies();
      addSupplies(supplies, 'food', 50);
      expect(supplies.food).toBe(50);
    });

    it('adds to money', () => {
      const supplies = createEmptySupplies();
      addSupplies(supplies, 'money', 100);
      expect(supplies.money).toBe(100);
    });
  });

  describe('hasEnough', () => {
    it('returns true when enough', () => {
      const supplies = createSupplies();
      expect(hasEnough(supplies, 'food', 50)).toBe(true);
    });

    it('returns false when not enough', () => {
      const supplies = createEmptySupplies();
      expect(hasEnough(supplies, 'food', 50)).toBe(false);
    });

    it('returns true for exact amount', () => {
      const supplies = createEmptySupplies();
      supplies.food = 50;
      expect(hasEnough(supplies, 'food', 50)).toBe(true);
    });
  });

  describe('getDailyFoodNeed', () => {
    it('calculates bare rations', () => {
      expect(getDailyFoodNeed(4, RationsType.Bare)).toBe(4);
    });

    it('calculates meager rations', () => {
      expect(getDailyFoodNeed(4, RationsType.Meager)).toBe(8);
    });

    it('calculates filling rations', () => {
      expect(getDailyFoodNeed(4, RationsType.Filling)).toBe(12);
    });
  });

  describe('canFeedParty', () => {
    it('returns true when enough food', () => {
      const supplies = createSupplies();
      expect(canFeedParty(supplies, 4, RationsType.Filling)).toBe(true);
    });

    it('returns false when not enough food', () => {
      const supplies = createEmptySupplies();
      supplies.food = 5;
      expect(canFeedParty(supplies, 4, RationsType.Filling)).toBe(false);
    });
  });

  describe('feedParty', () => {
    it('consumes food and returns 0 shortfall', () => {
      const supplies = createSupplies();
      const shortfall = feedParty(supplies, 4, RationsType.Meager);
      expect(shortfall).toBe(0);
      expect(supplies.food).toBe(STARTING_FOOD - 8);
    });

    it('returns shortfall when not enough food', () => {
      const supplies = createEmptySupplies();
      supplies.food = 5;
      const shortfall = feedParty(supplies, 4, RationsType.Meager);
      expect(shortfall).toBe(3);
      expect(supplies.food).toBe(0);
    });
  });

  describe('getSupplyValue', () => {
    it('calculates total value', () => {
      const supplies = createEmptySupplies();
      supplies.food = 100;
      supplies.ammunition = 50;
      supplies.medicine = 2;
      supplies.spareParts = 1;
      supplies.money = 50;
      // 100*0.2 + 50*0.1 + 2*5 + 1*10 + 50 = 20 + 5 + 10 + 10 + 50 = 95
      expect(getSupplyValue(supplies)).toBe(95);
    });
  });

  describe('cloneSupplies', () => {
    it('creates independent copy', () => {
      const original = createSupplies();
      const clone = cloneSupplies(original);
      clone.food = 0;
      expect(original.food).toBe(STARTING_FOOD);
    });
  });
});
