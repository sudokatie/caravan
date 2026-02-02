import {
  rollForEvent,
  generateEvent,
  applyEventChoice,
  resetEventIds,
} from '../game/Events';
import { EventType, GameData, GameScreen, PaceType, RationsType, WeatherType } from '../game/types';

function createTestGameData(): GameData {
  return {
    screen: GameScreen.Traveling,
    day: 1,
    month: 4,
    year: 1848,
    distanceTraveled: 0,
    currentLocationIndex: 0,
    party: [
      { id: 0, name: 'John', health: 100, status: 'healthy', sicknessTurns: 0 },
      { id: 1, name: 'Mary', health: 100, status: 'healthy', sicknessTurns: 0 },
      { id: 2, name: 'Tom', health: 100, status: 'healthy', sicknessTurns: 0 },
    ],
    supplies: {
      food: 200,
      ammunition: 100,
      medicine: 5,
      spareParts: 2,
      money: 100,
    },
    wagon: { condition: 100, oxen: 2 },
    pace: PaceType.Steady,
    rations: RationsType.Filling,
    weather: WeatherType.Clear,
    currentEvent: null,
    messages: [],
  };
}

describe('Events', () => {
  beforeEach(() => {
    resetEventIds();
  });

  describe('rollForEvent', () => {
    it('returns null or valid event type', () => {
      for (let i = 0; i < 50; i++) {
        const result = rollForEvent();
        if (result !== null) {
          expect(Object.values(EventType)).toContain(result);
        }
      }
    });

    it('sometimes returns null (no event)', () => {
      // With multiple rolls, should see some nulls
      let nullCount = 0;
      for (let i = 0; i < 100; i++) {
        if (rollForEvent() === null) {
          nullCount++;
        }
      }
      expect(nullCount).toBeGreaterThan(0);
    });
  });

  describe('generateEvent', () => {
    it('generates illness event with choices', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Illness, state);
      
      expect(event.type).toBe(EventType.Illness);
      expect(event.title).toContain('Illness');
      expect(event.choices.length).toBe(2);
      expect(event.id).toBe(0);
    });

    it('generates injury event with choices', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Injury, state);
      
      expect(event.type).toBe(EventType.Injury);
      expect(event.choices.length).toBe(2);
    });

    it('generates breakdown event with choices', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Breakdown, state);
      
      expect(event.type).toBe(EventType.Breakdown);
      expect(event.title).toContain('Wagon');
      expect(event.choices.length).toBe(2);
    });

    it('generates weather event', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Weather, state);
      
      expect(event.type).toBe(EventType.Weather);
      expect(event.choices.length).toBeGreaterThanOrEqual(1);
    });

    it('generates theft event', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Theft, state);
      
      expect(event.type).toBe(EventType.Theft);
      expect(event.title).toContain('Thieves');
    });

    it('generates discovery event', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Discovery, state);
      
      expect(event.type).toBe(EventType.Discovery);
    });

    it('generates animal event', () => {
      const state = createTestGameData();
      const event = generateEvent(EventType.Animal, state);
      
      expect(event.type).toBe(EventType.Animal);
    });

    it('increments event ID', () => {
      const state = createTestGameData();
      const event1 = generateEvent(EventType.Illness, state);
      const event2 = generateEvent(EventType.Injury, state);
      
      expect(event1.id).toBe(0);
      expect(event2.id).toBe(1);
    });
  });

  describe('applyEventChoice', () => {
    describe('illness', () => {
      it('uses medicine when treating', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Illness, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.supplyChange?.medicine).toBe(-1);
      });

      it('causes health loss when not treating', () => {
        const state = createTestGameData();
        state.supplies.medicine = 0;
        const event = generateEvent(EventType.Illness, state);
        const result = applyEventChoice(event, 1, state);
        
        expect(result.healthChange).toBeDefined();
        expect(result.daysLost).toBeDefined();
      });
    });

    describe('injury', () => {
      it('uses medicine when treating', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Injury, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.supplyChange?.medicine).toBe(-1);
      });

      it('causes health loss and delay without treatment', () => {
        const state = createTestGameData();
        state.supplies.medicine = 0;
        const event = generateEvent(EventType.Injury, state);
        const result = applyEventChoice(event, 1, state);
        
        expect(result.healthChange).toBeDefined();
      });
    });

    describe('breakdown', () => {
      it('uses spare parts when repairing', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Breakdown, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.supplyChange?.spareParts).toBe(-1);
      });

      it('causes delay with makeshift fix', () => {
        const state = createTestGameData();
        state.supplies.spareParts = 0;
        const event = generateEvent(EventType.Breakdown, state);
        const result = applyEventChoice(event, 1, state);
        
        expect(result.daysLost).toBe(1);
      });
    });

    describe('weather', () => {
      it('causes food loss', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Weather, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.supplyChange?.food).toBeLessThan(0);
      });
    });

    describe('theft', () => {
      it('causes supply losses', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Theft, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.supplyChange?.food).toBeLessThan(0);
        expect(result.supplyChange?.ammunition).toBeLessThan(0);
      });
    });

    describe('discovery', () => {
      it('provides positive outcome', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Discovery, state);
        const result = applyEventChoice(event, 0, state);
        
        // Should either give supplies or health
        const hasPositiveSupply = result.supplyChange && 
          Object.values(result.supplyChange).some(v => v !== undefined && v > 0);
        const hasHealthBoost = result.healthChange && result.healthChange.size > 0;
        
        expect(hasPositiveSupply || hasHealthBoost).toBe(true);
      });
    });

    describe('animal', () => {
      it('returns a result', () => {
        const state = createTestGameData();
        const event = generateEvent(EventType.Animal, state);
        const result = applyEventChoice(event, 0, state);
        
        expect(result.message).toBeDefined();
      });
    });
  });
});
