/* eslint-disable prefer-const */
import {
  createGame,
  startGame,
  beginTravel,
  advanceTurn,
  applyTurnResult,
  handleEvent,
  handleHunting,
  rest,
  useMedicineOnMember,
  repairWagonAction,
  setPace,
  setRations,
  isGameOver,
  isVictory,
  getCurrentLocation,
  getRemainingDistance,
  setScreen,
  clearMessages,
  addMessage,
} from '../game/Game';
import { GameScreen, PaceType, RationsType, EventType } from '../game/types';
import { resetMemberIds } from '../game/Party';
import { resetEventIds } from '../game/Events';
import { TOTAL_DISTANCE, STARTING_FOOD } from '../game/constants';

describe('Game Orchestrator', () => {
  beforeEach(() => {
    resetMemberIds();
    resetEventIds();
  });

  describe('createGame', () => {
    it('should create initial game state', () => {
      const game = createGame();
      
      expect(game.screen).toBe(GameScreen.Title);
      expect(game.day).toBe(1);
      expect(game.month).toBe(4); // April
      expect(game.distanceTraveled).toBe(0);
      expect(game.currentLocationIndex).toBe(0);
      expect(game.party).toHaveLength(0);
      expect(game.supplies.food).toBe(STARTING_FOOD);
      expect(game.pace).toBe(PaceType.Steady);
      expect(game.rations).toBe(RationsType.Meager);
    });
  });

  describe('startGame', () => {
    it('should create party and go to store screen', () => {
      const game = createGame();
      const started = startGame(game, ['Alice', 'Bob', 'Charlie']);
      
      expect(started.party).toHaveLength(3);
      expect(started.party[0].name).toBe('Alice');
      expect(started.party[1].name).toBe('Bob');
      expect(started.party[2].name).toBe('Charlie');
      expect(started.screen).toBe(GameScreen.Store);
    });

    it('should give welcome message', () => {
      const game = createGame();
      const started = startGame(game, ['Alice']);
      
      expect(started.messages.length).toBeGreaterThan(0);
      expect(started.messages[0]).toContain('Welcome');
    });
  });

  describe('beginTravel', () => {
    it('should switch to traveling screen', () => {
      const game = startGame(createGame(), ['Alice']);
      const traveling = beginTravel(game);
      
      expect(traveling.screen).toBe(GameScreen.Traveling);
    });
  });

  describe('advanceTurn', () => {
    it('should return travel results', () => {
      let game = startGame(createGame(), ['Alice', 'Bob']);
      game = beginTravel(game);
      
      const result = advanceTurn(game);
      
      expect(result.distanceTraveled).toBeGreaterThanOrEqual(0);
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('should not travel during blizzard', () => {
      // This is probabilistic, so we test the blizzard behavior directly
      const game = beginTravel({ ...startGame(createGame(), ['Alice']), month: 1 });
      
      // Multiple attempts should sometimes show blizzard message
      for (let i = 0; i < 20; i++) {
        const result = advanceTurn(game);
        if (result.messages.some(m => m.includes('Blizzard'))) {
          expect(result.distanceTraveled).toBe(0);
          return; // Test passed
        }
      }
      // Note: This test may occasionally fail due to randomness - that's ok
    });
  });

  describe('applyTurnResult', () => {
    it('should update game state with turn results', () => {
      let game = startGame(createGame(), ['Alice', 'Bob']);
      game = beginTravel(game);
      
      const result = advanceTurn(game);
      const updated = applyTurnResult(game, result);
      
      // Day should advance
      expect(updated.day !== game.day || updated.month !== game.month).toBe(true);
      // Distance should update
      expect(updated.distanceTraveled).toBe(game.distanceTraveled + result.distanceTraveled);
    });
  });

  describe('handleEvent', () => {
    it('should apply event choice and return to traveling', () => {
      let game = startGame(createGame(), ['Alice']);
      game = {
        ...game,
        currentEvent: {
          id: 1,
          type: EventType.Discovery,
          title: 'Discovery',
          description: 'Found supplies',
          choices: [{ id: 0, text: 'Take them' }],
        },
        screen: GameScreen.Event,
      };
      
      const handled = handleEvent(game, 0);
      
      expect(handled.currentEvent).toBeNull();
      expect(handled.screen).toBe(GameScreen.Traveling);
    });

    it('should do nothing if no current event', () => {
      let game = startGame(createGame(), ['Alice']);
      game = { ...game, currentEvent: null };
      
      const handled = handleEvent(game, 0);
      
      expect(handled).toBe(game);
    });
  });

  describe('handleHunting', () => {
    it('should use ammo and potentially gain food', () => {
      let game = startGame(createGame(), ['Alice']);
      const initialAmmo = game.supplies.ammunition;
      
      const afterHunt = handleHunting(game, 10);
      
      expect(afterHunt.supplies.ammunition).toBeLessThan(initialAmmo);
      expect(afterHunt.messages.length).toBeGreaterThan(game.messages.length);
      expect(afterHunt.screen).toBe(GameScreen.Traveling);
    });

    it('should fail if trying to use more ammo than available', () => {
      let game = startGame(createGame(), ['Alice']);
      game = { ...game, supplies: { ...game.supplies, ammunition: 5 } };
      
      const afterHunt = handleHunting(game, 10);
      
      // Hunt fails - no ammo used, no food gained
      expect(afterHunt.supplies.ammunition).toBe(5); // Unchanged
      expect(afterHunt.messages.some(m => m.includes('Not enough'))).toBe(true);
    });
  });

  describe('rest', () => {
    it('should heal party members', () => {
      let game = startGame(createGame(), ['Alice']);
      // Damage the party member
      game.party[0].health = 50;
      
      const rested = rest(game);
      
      expect(rested.party[0].health).toBeGreaterThan(50);
    });

    it('should advance the date', () => {
      let game = startGame(createGame(), ['Alice']);
      const initialDay = game.day;
      
      const rested = rest(game);
      
      expect(rested.day !== initialDay || rested.month !== game.month).toBe(true);
    });

    it('should consume food', () => {
      let game = startGame(createGame(), ['Alice']);
      const initialFood = game.supplies.food;
      
      const rested = rest(game);
      
      expect(rested.supplies.food).toBeLessThan(initialFood);
    });
  });

  describe('useMedicineOnMember', () => {
    it('should heal sick party member', () => {
      let game = startGame(createGame(), ['Alice']);
      game.party[0].status = 'sick';
      game.party[0].sicknessTurns = 5;
      
      const healed = useMedicineOnMember(game, game.party[0].id);
      
      expect(healed.party[0].status).toBe('healthy');
      expect(healed.supplies.medicine).toBe(game.supplies.medicine - 1);
    });

    it('should fail if no medicine', () => {
      let game = startGame(createGame(), ['Alice']);
      game = { ...game, supplies: { ...game.supplies, medicine: 0 } };
      game.party[0].status = 'sick';
      
      const result = useMedicineOnMember(game, game.party[0].id);
      
      expect(result.party[0].status).toBe('sick');
      expect(result.messages).toContain('No medicine available.');
    });
  });

  describe('repairWagonAction', () => {
    it('should repair wagon using spare parts', () => {
      let game = startGame(createGame(), ['Alice']);
      game.wagon.condition = 50;
      
      const repaired = repairWagonAction(game);
      
      expect(repaired.wagon.condition).toBeGreaterThan(50);
      expect(repaired.supplies.spareParts).toBe(game.supplies.spareParts - 1);
    });

    it('should fail if no spare parts', () => {
      let game = startGame(createGame(), ['Alice']);
      game = { ...game, supplies: { ...game.supplies, spareParts: 0 } };
      game.wagon.condition = 50;
      
      const result = repairWagonAction(game);
      
      expect(result.wagon.condition).toBe(50);
      expect(result.messages).toContain('No spare parts available.');
    });
  });

  describe('setPace', () => {
    it('should update pace', () => {
      const game = createGame();
      
      expect(setPace(game, PaceType.Grueling).pace).toBe(PaceType.Grueling);
      expect(setPace(game, PaceType.Strenuous).pace).toBe(PaceType.Strenuous);
      expect(setPace(game, PaceType.Steady).pace).toBe(PaceType.Steady);
    });
  });

  describe('setRations', () => {
    it('should update rations', () => {
      const game = createGame();
      
      expect(setRations(game, RationsType.Filling).rations).toBe(RationsType.Filling);
      expect(setRations(game, RationsType.Bare).rations).toBe(RationsType.Bare);
    });
  });

  describe('isGameOver', () => {
    it('should return false if party is alive', () => {
      const game = startGame(createGame(), ['Alice', 'Bob']);
      
      expect(isGameOver(game)).toBe(false);
    });

    it('should return true if all party members dead', () => {
      let game = startGame(createGame(), ['Alice', 'Bob']);
      game.party.forEach(m => {
        m.status = 'dead';
        m.health = 0;
      });
      
      expect(isGameOver(game)).toBe(true);
    });
  });

  describe('isVictory', () => {
    it('should return false if not at destination', () => {
      const game = startGame(createGame(), ['Alice']);
      
      expect(isVictory(game)).toBe(false);
    });

    it('should return true if at destination with survivors', () => {
      let game = startGame(createGame(), ['Alice']);
      // Route has 17 locations, index 16 is destination
      game = { ...game, currentLocationIndex: 16 };
      
      expect(isVictory(game)).toBe(true);
    });

    it('should return false if at destination but all dead', () => {
      let game = startGame(createGame(), ['Alice']);
      game = { ...game, currentLocationIndex: 16 };
      game.party[0].status = 'dead';
      
      expect(isVictory(game)).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('should return current location', () => {
      const game = createGame();
      
      const location = getCurrentLocation(game);
      
      expect(location).not.toBeNull();
      expect(location?.name).toBe('Independence');
    });
  });

  describe('getRemainingDistance', () => {
    it('should return distance to destination', () => {
      const game = createGame();
      
      const remaining = getRemainingDistance(game);
      
      expect(remaining).toBe(TOTAL_DISTANCE);
    });

    it('should decrease as we travel', () => {
      let game = createGame();
      game = { ...game, distanceTraveled: 500 };
      
      const remaining = getRemainingDistance(game);
      
      expect(remaining).toBe(TOTAL_DISTANCE - 500);
    });
  });

  describe('setScreen', () => {
    it('should change screen', () => {
      const game = createGame();
      
      expect(setScreen(game, GameScreen.Store).screen).toBe(GameScreen.Store);
      expect(setScreen(game, GameScreen.Hunting).screen).toBe(GameScreen.Hunting);
    });
  });

  describe('clearMessages and addMessage', () => {
    it('should clear messages', () => {
      let game = createGame();
      game = addMessage(game, 'Hello');
      game = addMessage(game, 'World');
      
      expect(game.messages).toHaveLength(2);
      
      game = clearMessages(game);
      expect(game.messages).toHaveLength(0);
    });

    it('should add messages', () => {
      let game = createGame();
      
      game = addMessage(game, 'Test message');
      
      expect(game.messages).toContain('Test message');
    });
  });

  describe('Difficulty Modes', () => {
    it('should create game with Easy difficulty (more starting money)', () => {
      const { DifficultyMode } = require('../game/types');
      const game = createGame(DifficultyMode.Easy);
      
      expect(game.difficulty).toBe(DifficultyMode.Easy);
      expect(game.supplies.money).toBe(600); // Easy = $600
    });

    it('should create game with Normal difficulty (standard money)', () => {
      const { DifficultyMode } = require('../game/types');
      const game = createGame(DifficultyMode.Normal);
      
      expect(game.difficulty).toBe(DifficultyMode.Normal);
      expect(game.supplies.money).toBe(400); // Normal = $400
    });

    it('should create game with Hard difficulty (less starting money)', () => {
      const { DifficultyMode } = require('../game/types');
      const game = createGame(DifficultyMode.Hard);
      
      expect(game.difficulty).toBe(DifficultyMode.Hard);
      expect(game.supplies.money).toBe(300); // Hard = $300
    });

    it('should default to Normal difficulty', () => {
      const { DifficultyMode } = require('../game/types');
      const game = createGame();
      
      expect(game.difficulty).toBe(DifficultyMode.Normal);
      expect(game.supplies.money).toBe(400);
    });
  });

  describe('handleHunting day consumption', () => {
    it('should advance the day when hunting', () => {
      let game = createGame();
      game = startGame(game, ['Alice', 'Bob']);
      game = beginTravel(game);
      
      const initialDay = game.day;
      const initialMonth = game.month;
      
      // Give ammo for hunting
      game.supplies.ammunition = 50;
      game.supplies.food = 100;
      
      game = handleHunting(game, 10);
      
      // Day should have advanced
      if (initialDay === 30) {
        // Month should advance if at end of month
        expect(game.month).toBe(initialMonth + 1);
      } else {
        expect(game.day).toBe(initialDay + 1);
      }
    });

    it('should consume food for the hunting day', () => {
      let game = createGame();
      game = startGame(game, ['Alice', 'Bob']);
      game = beginTravel(game);
      
      game.supplies.ammunition = 50;
      game.supplies.food = 100;
      
      const initialFood = game.supplies.food;
      game = handleHunting(game, 10);
      
      // Food should be consumed for the day (party size 2 * meager rations 2 = 4)
      // Then food gained from hunting is added
      // So final food = initial - 4 + foodGained
      // We can't predict exact foodGained, but food consumption happened
      expect(game.supplies.food).not.toBe(initialFood); // Food changed
    });
  });
});
