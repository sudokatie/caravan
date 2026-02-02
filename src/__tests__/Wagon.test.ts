import {
  createWagon,
  damage,
  repair,
  addOxen,
  removeOxen,
  loseOxen,
  getSpeedModifier,
  isBroken,
  canTravel,
  getConditionPercent,
  getConditionStatus,
} from '../game/Wagon';
import {
  MAX_WAGON_CONDITION,
  MAX_OXEN,
  MIN_OXEN,
  STARTING_OXEN,
  OXEN_SPEED_MOD,
} from '../game/constants';

describe('Wagon', () => {
  describe('createWagon', () => {
    it('creates wagon with max condition', () => {
      const wagon = createWagon();
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION);
    });

    it('creates wagon with starting oxen', () => {
      const wagon = createWagon();
      expect(wagon.oxen).toBe(STARTING_OXEN);
    });
  });

  describe('damage', () => {
    it('reduces wagon condition', () => {
      const wagon = createWagon();
      damage(wagon, 30);
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION - 30);
    });

    it('clamps condition to 0', () => {
      const wagon = createWagon();
      damage(wagon, 150);
      expect(wagon.condition).toBe(0);
    });

    it('handles multiple damage instances', () => {
      const wagon = createWagon();
      damage(wagon, 20);
      damage(wagon, 30);
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION - 50);
    });
  });

  describe('repair', () => {
    it('restores condition by 25 by default', () => {
      const wagon = createWagon();
      damage(wagon, 50);
      const restored = repair(wagon);
      expect(restored).toBe(25);
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION - 25);
    });

    it('caps at max condition', () => {
      const wagon = createWagon();
      damage(wagon, 10);
      const restored = repair(wagon);
      expect(restored).toBe(10);
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION);
    });

    it('full repair restores to max', () => {
      const wagon = createWagon();
      damage(wagon, 80);
      const restored = repair(wagon, true);
      expect(restored).toBe(80);
      expect(wagon.condition).toBe(MAX_WAGON_CONDITION);
    });

    it('returns 0 if already at max', () => {
      const wagon = createWagon();
      const restored = repair(wagon);
      expect(restored).toBe(0);
    });
  });

  describe('addOxen', () => {
    it('adds an ox', () => {
      const wagon = createWagon();
      const initialOxen = wagon.oxen;
      const result = addOxen(wagon);
      expect(result).toBe(true);
      expect(wagon.oxen).toBe(initialOxen + 1);
    });

    it('returns false at max oxen', () => {
      const wagon = createWagon();
      wagon.oxen = MAX_OXEN;
      const result = addOxen(wagon);
      expect(result).toBe(false);
      expect(wagon.oxen).toBe(MAX_OXEN);
    });
  });

  describe('removeOxen', () => {
    it('removes an ox', () => {
      const wagon = createWagon();
      wagon.oxen = 3;
      const result = removeOxen(wagon);
      expect(result).toBe(true);
      expect(wagon.oxen).toBe(2);
    });

    it('returns false at minimum oxen', () => {
      const wagon = createWagon();
      wagon.oxen = MIN_OXEN;
      const result = removeOxen(wagon);
      expect(result).toBe(false);
      expect(wagon.oxen).toBe(MIN_OXEN);
    });
  });

  describe('loseOxen', () => {
    it('loses an ox', () => {
      const wagon = createWagon();
      const initialOxen = wagon.oxen;
      const result = loseOxen(wagon);
      expect(result).toBe(true);
      expect(wagon.oxen).toBe(initialOxen - 1);
    });

    it('can go below minimum', () => {
      const wagon = createWagon();
      wagon.oxen = MIN_OXEN;
      const result = loseOxen(wagon);
      expect(result).toBe(true);
      expect(wagon.oxen).toBe(MIN_OXEN - 1);
    });

    it('returns false at 0 oxen', () => {
      const wagon = createWagon();
      wagon.oxen = 0;
      const result = loseOxen(wagon);
      expect(result).toBe(false);
      expect(wagon.oxen).toBe(0);
    });
  });

  describe('getSpeedModifier', () => {
    it('returns 1.0 at minimum oxen', () => {
      const wagon = createWagon();
      wagon.oxen = MIN_OXEN;
      expect(getSpeedModifier(wagon)).toBe(1);
    });

    it('returns 0 below minimum oxen', () => {
      const wagon = createWagon();
      wagon.oxen = 0;
      expect(getSpeedModifier(wagon)).toBe(0);
    });

    it('increases with extra oxen', () => {
      const wagon = createWagon();
      wagon.oxen = MIN_OXEN + 1;
      expect(getSpeedModifier(wagon)).toBe(1 + OXEN_SPEED_MOD);
    });

    it('calculates correctly at max oxen', () => {
      const wagon = createWagon();
      wagon.oxen = MAX_OXEN;
      const extraOxen = MAX_OXEN - MIN_OXEN;
      expect(getSpeedModifier(wagon)).toBe(1 + extraOxen * OXEN_SPEED_MOD);
    });
  });

  describe('isBroken', () => {
    it('returns false when condition > 0', () => {
      const wagon = createWagon();
      expect(isBroken(wagon)).toBe(false);
    });

    it('returns true when condition is 0', () => {
      const wagon = createWagon();
      wagon.condition = 0;
      expect(isBroken(wagon)).toBe(true);
    });
  });

  describe('canTravel', () => {
    it('returns true when wagon is functional', () => {
      const wagon = createWagon();
      expect(canTravel(wagon)).toBe(true);
    });

    it('returns false when broken', () => {
      const wagon = createWagon();
      wagon.condition = 0;
      expect(canTravel(wagon)).toBe(false);
    });

    it('returns false without minimum oxen', () => {
      const wagon = createWagon();
      wagon.oxen = 0;
      expect(canTravel(wagon)).toBe(false);
    });

    it('returns false when both broken and no oxen', () => {
      const wagon = createWagon();
      wagon.condition = 0;
      wagon.oxen = 0;
      expect(canTravel(wagon)).toBe(false);
    });
  });

  describe('getConditionPercent', () => {
    it('returns 100 at max condition', () => {
      const wagon = createWagon();
      expect(getConditionPercent(wagon)).toBe(100);
    });

    it('returns 0 when broken', () => {
      const wagon = createWagon();
      wagon.condition = 0;
      expect(getConditionPercent(wagon)).toBe(0);
    });

    it('returns correct percentage', () => {
      const wagon = createWagon();
      wagon.condition = 50;
      expect(getConditionPercent(wagon)).toBe(50);
    });
  });

  describe('getConditionStatus', () => {
    it('returns Excellent at 76-100%', () => {
      const wagon = createWagon();
      wagon.condition = 80;
      expect(getConditionStatus(wagon)).toBe('Excellent');
    });

    it('returns Good at 51-75%', () => {
      const wagon = createWagon();
      wagon.condition = 60;
      expect(getConditionStatus(wagon)).toBe('Good');
    });

    it('returns Fair at 26-50%', () => {
      const wagon = createWagon();
      wagon.condition = 40;
      expect(getConditionStatus(wagon)).toBe('Fair');
    });

    it('returns Poor at 1-25%', () => {
      const wagon = createWagon();
      wagon.condition = 20;
      expect(getConditionStatus(wagon)).toBe('Poor');
    });

    it('returns Broken at 0%', () => {
      const wagon = createWagon();
      wagon.condition = 0;
      expect(getConditionStatus(wagon)).toBe('Broken');
    });
  });
});
