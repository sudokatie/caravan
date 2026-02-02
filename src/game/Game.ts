// Game orchestrator for Caravan

import {
  GameData,
  GameScreen,
  GameEvent,
  PaceType,
  RationsType,
  WeatherType,
  TurnResult,
  Location,
  DifficultyMode,
} from './types';
import {
  STARTING_MONTH,
  STARTING_YEAR,
  MAX_WAGON_CONDITION,
  STARVATION_DAMAGE,
  REST_HEALTH_BONUS,
  DIFFICULTY_SETTINGS,
} from './constants';
import { createParty, applyDailyEffects, isPartyAlive, updateHealth, getAliveMembers, healMember } from './Party';
import { createSupplies, getDailyFoodNeed, cloneSupplies } from './Supplies';
import { createWagon, repair as repairWagon } from './Wagon';
import { generateWeather, getWeatherEffect } from './Weather';
import { rollForEvent, generateEvent, applyEventChoice } from './Events';
import { travelOneDay, advanceDay, canContinue, getDistanceRemaining } from './Travel';
import { ford, caulkAndFloat, takeFerry, wait as riverWait } from './River';
import { hunt } from './Hunting';
import { getLocation, isDestination } from './locations';

/**
 * Create initial game state
 */
export function createGame(difficulty: DifficultyMode = DifficultyMode.Normal): GameData {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  const supplies = createSupplies();
  supplies.money = settings.startingMoney;

  return {
    screen: GameScreen.Title,
    difficulty,
    day: 1,
    month: STARTING_MONTH,
    year: STARTING_YEAR,
    distanceTraveled: 0,
    currentLocationIndex: 0,
    party: [],
    supplies,
    wagon: createWagon(),
    pace: PaceType.Steady,
    rations: RationsType.Meager,
    weather: WeatherType.Clear,
    currentEvent: null,
    messages: [],
  };
}

/**
 * Start game with named party members and optional starting month
 */
export function startGame(state: GameData, names: string[], startMonth?: number): GameData {
  const party = createParty(names);
  return {
    ...state,
    party,
    month: startMonth ?? state.month,
    screen: GameScreen.Store,
    messages: ['Welcome to the trail! Stock up on supplies before you leave.'],
  };
}

/**
 * Begin traveling from current location
 */
export function beginTravel(state: GameData): GameData {
  return {
    ...state,
    screen: GameScreen.Traveling,
    messages: ['You set out on the trail.'],
  };
}

/**
 * Advance one turn (one day)
 */
export function advanceTurn(state: GameData): TurnResult {
  const messages: string[] = [];
  const newSupplies = cloneSupplies(state.supplies);

  // Generate weather for the day
  const weather = generateWeather(state.month);

  // Check if we can travel
  const { canTravel, reason } = canContinue(
    state.party,
    state.supplies,
    state.wagon,
    state.currentLocationIndex
  );

  if (!canTravel) {
    if (reason?.includes('destination')) {
      return {
        distanceTraveled: 0,
        reachedLocation: null,
        event: null,
        messages: [reason],
      };
    }
    messages.push(reason || 'Cannot continue.');
    return { distanceTraveled: 0, reachedLocation: null, event: null, messages };
  }

  // Travel for the day
  const travelResult = travelOneDay(
    state.distanceTraveled,
    state.currentLocationIndex,
    state.pace,
    weather,
    state.wagon
  );

  if (travelResult.distanceTraveled > 0) {
    messages.push(`Traveled ${travelResult.distanceTraveled} miles.`);
  } else if (weather === WeatherType.Blizzard) {
    messages.push('Blizzard! Cannot travel today.');
  }

  // Consume food
  const aliveCount = getAliveMembers(state.party).length;
  const foodNeeded = getDailyFoodNeed(aliveCount, state.rations);
  
  if (newSupplies.food >= foodNeeded) {
    newSupplies.food -= foodNeeded;
  } else {
    // Starvation
    newSupplies.food = 0;
    messages.push('Not enough food! The party is starving.');
    for (const member of state.party) {
      if (member.status !== 'dead') {
        updateHealth(state.party, member.id, -STARVATION_DAMAGE);
      }
    }
  }

  // Apply weather effects (scaled by difficulty)
  const weatherEffect = getWeatherEffect(weather);
  const diffSettings = DIFFICULTY_SETTINGS[state.difficulty];
  if (weatherEffect.healthMod !== 0) {
    // Apply harshness multiplier to negative weather effects
    const scaledHealthMod = weatherEffect.healthMod < 0
      ? Math.floor(weatherEffect.healthMod * diffSettings.weatherHarshness)
      : weatherEffect.healthMod;
    for (const member of state.party) {
      if (member.status !== 'dead') {
        updateHealth(state.party, member.id, scaledHealthMod);
      }
    }
    if (scaledHealthMod < 0) {
      messages.push(`The ${weather} weather is taking a toll on the party.`);
    }
  }

  // Apply daily effects (sickness, injury, pace, rations)
  const dayOfWeek = state.day % 7 === 0 ? 7 : state.day % 7;
  const effectMessages = applyDailyEffects(state.party, state.rations, state.pace, dayOfWeek);
  messages.push(...effectMessages);

  // Check for random event (frequency affected by difficulty)
  let event: GameEvent | null = null;
  const eventType = rollForEvent(diffSettings.eventMultiplier);
  if (eventType) {
    event = generateEvent(eventType, state);
  }

  // Check for death
  if (!isPartyAlive(state.party)) {
    messages.push('Your entire party has perished.');
  }

  return {
    distanceTraveled: travelResult.distanceTraveled,
    reachedLocation: travelResult.reachedLocation,
    event,
    messages,
  };
}

/**
 * Apply turn results to game state
 */
export function applyTurnResult(state: GameData, result: TurnResult): GameData {
  const aliveCount = getAliveMembers(state.party).length;
  const foodNeeded = getDailyFoodNeed(aliveCount, state.rations);
  const newSupplies = cloneSupplies(state.supplies);
  newSupplies.food = Math.max(0, newSupplies.food - foodNeeded);

  // Advance date
  const newDate = advanceDay({ day: state.day, month: state.month, year: state.year });

  return {
    ...state,
    day: newDate.day,
    month: newDate.month,
    year: newDate.year,
    distanceTraveled: state.distanceTraveled + result.distanceTraveled,
    currentLocationIndex: result.reachedLocation
      ? state.currentLocationIndex + 1
      : state.currentLocationIndex,
    weather: generateWeather(newDate.month),
    supplies: newSupplies,
    currentEvent: result.event,
    screen: result.event ? GameScreen.Event : 
            result.reachedLocation?.type === 'river' ? GameScreen.River :
            result.reachedLocation ? GameScreen.Landmark : GameScreen.Traveling,
    messages: [...state.messages, ...result.messages],
  };
}

/**
 * Handle event choice
 */
export function handleEvent(state: GameData, choiceId: number): GameData {
  if (!state.currentEvent) return state;

  const result = applyEventChoice(state.currentEvent, choiceId, state);
  const messages = [...state.messages, result.message];

  // Apply health changes
  if (result.healthChange) {
    result.healthChange.forEach((delta, memberId) => {
      updateHealth(state.party, memberId, delta);
    });
  }

  // Apply supply changes
  const newSupplies = cloneSupplies(state.supplies);
  if (result.supplyChange) {
    if (result.supplyChange.food) newSupplies.food = Math.max(0, newSupplies.food + result.supplyChange.food);
    if (result.supplyChange.ammunition) newSupplies.ammunition = Math.max(0, newSupplies.ammunition + result.supplyChange.ammunition);
    if (result.supplyChange.medicine) newSupplies.medicine = Math.max(0, newSupplies.medicine + result.supplyChange.medicine);
    if (result.supplyChange.spareParts) newSupplies.spareParts = Math.max(0, newSupplies.spareParts + result.supplyChange.spareParts);
    if (result.supplyChange.money) newSupplies.money = Math.max(0, newSupplies.money + result.supplyChange.money);
  }

  return {
    ...state,
    supplies: newSupplies,
    currentEvent: null,
    screen: GameScreen.Traveling,
    messages,
  };
}

/**
 * Handle river crossing
 */
export function handleRiver(
  state: GameData,
  method: 'ford' | 'caulk' | 'ferry' | 'wait'
): GameData {
  const location = getLocation(state.currentLocationIndex);
  if (!location || location.type !== 'river') return state;

  const difficulty = location.riverDifficulty || 1;

  // Handle wait separately (different return type)
  if (method === 'wait') {
    const waitResult = riverWait(difficulty);
    // Advance days for waiting
    let newState = { ...state };
    for (let i = 0; i < waitResult.daysLost; i++) {
      const newDate = advanceDay({ day: newState.day, month: newState.month, year: newState.year });
      newState = { ...newState, ...newDate };
    }
    return {
      ...newState,
      messages: [...state.messages, waitResult.message],
      // Stay on river screen to try again with lower difficulty
    };
  }

  let result;
  switch (method) {
    case 'ford':
      result = ford(difficulty, state.supplies, state.party);
      break;
    case 'caulk':
      result = caulkAndFloat(difficulty, state.supplies, state.party);
      break;
    case 'ferry':
      result = takeFerry(difficulty, state.supplies.money);
      break;
  }

  const messages = [...state.messages, result.message];
  const newSupplies = cloneSupplies(state.supplies);

  // Apply supply losses
  if (result.suppliesLost) {
    if (result.suppliesLost.food) newSupplies.food = Math.max(0, newSupplies.food - result.suppliesLost.food);
    if (result.suppliesLost.ammunition) newSupplies.ammunition = Math.max(0, newSupplies.ammunition - result.suppliesLost.ammunition);
    if (result.suppliesLost.money) newSupplies.money = Math.max(0, newSupplies.money - result.suppliesLost.money);
  }

  // Apply member deaths
  if (result.membersLost) {
    for (const memberId of result.membersLost) {
      const member = state.party.find(m => m.id === memberId);
      if (member) {
        member.status = 'dead';
        member.health = 0;
        messages.push(`${member.name} drowned in the crossing.`);
      }
    }
  }

  // Move to next screen
  const newScreen = result.success ? GameScreen.Traveling : GameScreen.River;

  return {
    ...state,
    supplies: newSupplies,
    screen: newScreen,
    messages,
  };
}

/**
 * Handle hunting (takes 1 day)
 */
export function handleHunting(state: GameData, ammoToUse: number): GameData {
  const result = hunt(ammoToUse, state.supplies.ammunition);
  
  // Advance date (hunting takes a full day)
  const newDate = advanceDay({ day: state.day, month: state.month, year: state.year });

  // Consume food for the day
  const aliveCount = getAliveMembers(state.party).length;
  const foodNeeded = getDailyFoodNeed(aliveCount, state.rations);
  
  const newSupplies = cloneSupplies(state.supplies);
  newSupplies.ammunition -= result.ammoUsed;
  newSupplies.food += result.foodGained;
  newSupplies.food = Math.max(0, newSupplies.food - foodNeeded);

  return {
    ...state,
    day: newDate.day,
    month: newDate.month,
    year: newDate.year,
    supplies: newSupplies,
    screen: GameScreen.Traveling,
    messages: [...state.messages, result.message],
  };
}

/**
 * Rest at landmark (one day)
 */
export function rest(state: GameData): GameData {
  // Heal party members (amount affected by difficulty)
  const diffSettings = DIFFICULTY_SETTINGS[state.difficulty];
  const healAmount = REST_HEALTH_BONUS + diffSettings.healthRegenBonus;
  
  for (const member of state.party) {
    if (member.status !== 'dead') {
      updateHealth(state.party, member.id, healAmount);
    }
  }

  // Advance date
  const newDate = advanceDay({ day: state.day, month: state.month, year: state.year });

  // Consume food
  const aliveCount = getAliveMembers(state.party).length;
  const foodNeeded = getDailyFoodNeed(aliveCount, state.rations);
  const newSupplies = cloneSupplies(state.supplies);
  newSupplies.food = Math.max(0, newSupplies.food - foodNeeded);

  return {
    ...state,
    day: newDate.day,
    month: newDate.month,
    year: newDate.year,
    supplies: newSupplies,
    messages: [...state.messages, 'The party rests and recovers.'],
  };
}

/**
 * Use medicine on a party member
 */
export function useMedicineOnMember(state: GameData, memberId: number): GameData {
  if (state.supplies.medicine <= 0) {
    return {
      ...state,
      messages: [...state.messages, 'No medicine available.'],
    };
  }

  const member = state.party.find(m => m.id === memberId);
  if (!member || member.status === 'dead') {
    return state;
  }

  const healed = healMember(state.party, memberId);
  if (healed) {
    const newSupplies = cloneSupplies(state.supplies);
    newSupplies.medicine -= 1;
    return {
      ...state,
      supplies: newSupplies,
      messages: [...state.messages, `${member.name} has been treated and is recovering.`],
    };
  }

  return state;
}

/**
 * Repair wagon
 */
export function repairWagonAction(state: GameData): GameData {
  if (state.supplies.spareParts <= 0) {
    return {
      ...state,
      messages: [...state.messages, 'No spare parts available.'],
    };
  }

  if (state.wagon.condition >= MAX_WAGON_CONDITION) {
    return {
      ...state,
      messages: [...state.messages, 'Wagon is already in good condition.'],
    };
  }

  const newWagon = { ...state.wagon };
  repairWagon(newWagon);
  const newSupplies = cloneSupplies(state.supplies);
  newSupplies.spareParts -= 1;

  return {
    ...state,
    wagon: newWagon,
    supplies: newSupplies,
    messages: [...state.messages, 'Wagon has been repaired.'],
  };
}

/**
 * Set travel pace
 */
export function setPace(state: GameData, pace: PaceType): GameData {
  return { ...state, pace };
}

/**
 * Set rations
 */
export function setRations(state: GameData, rations: RationsType): GameData {
  return { ...state, rations };
}

/**
 * Check if game is over (all dead)
 */
export function isGameOver(state: GameData): boolean {
  return !isPartyAlive(state.party);
}

/**
 * Check if player has won (reached destination)
 */
export function isVictory(state: GameData): boolean {
  return isDestination(state.currentLocationIndex) && isPartyAlive(state.party);
}

/**
 * Get current location
 */
export function getCurrentLocation(state: GameData): Location | null {
  return getLocation(state.currentLocationIndex);
}

/**
 * Get distance remaining
 */
export function getRemainingDistance(state: GameData): number {
  return getDistanceRemaining(state.distanceTraveled);
}

/**
 * Change screen
 */
export function setScreen(state: GameData, screen: GameScreen): GameData {
  return { ...state, screen };
}

/**
 * Set current event
 */
export function setCurrentEvent(state: GameData, event: GameEvent | null): GameData {
  return { ...state, currentEvent: event };
}

/**
 * Clear messages
 */
export function clearMessages(state: GameData): GameData {
  return { ...state, messages: [] };
}

/**
 * Add message
 */
export function addMessage(state: GameData, message: string): GameData {
  return { ...state, messages: [...state.messages, message] };
}
