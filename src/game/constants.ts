import { PaceType, RationsType, EventType, WeatherType, DifficultyMode } from './types';

// Difficulty settings
export const DIFFICULTY_SETTINGS: Record<DifficultyMode, {
  startingMoney: number;
  eventMultiplier: number;
  healthRegenBonus: number;
  weatherHarshness: number;
}> = {
  [DifficultyMode.Easy]: {
    startingMoney: 600,
    eventMultiplier: 0.5,    // Events 50% less frequent
    healthRegenBonus: 5,     // Extra health regen at rest
    weatherHarshness: 1.0,
  },
  [DifficultyMode.Normal]: {
    startingMoney: 400,
    eventMultiplier: 1.0,
    healthRegenBonus: 0,
    weatherHarshness: 1.0,
  },
  [DifficultyMode.Hard]: {
    startingMoney: 300,
    eventMultiplier: 1.5,    // Events 50% more frequent
    healthRegenBonus: -3,    // Slower recovery
    weatherHarshness: 1.5,   // Harsher weather effects
  },
};

// Journey
export const TOTAL_DISTANCE = 2000;
export const STARTING_MONTH = 4; // April
export const STARTING_YEAR = 1848;

// Starting resources
export const STARTING_MONEY = 400;
export const STARTING_FOOD = 200;
export const STARTING_AMMO = 100;
export const STARTING_MEDICINE = 5;
export const STARTING_PARTS = 2;
export const STARTING_OXEN = 2;

// Health
export const MAX_HEALTH = 100;
export const STARTING_HEALTH = 100;

// Wagon
export const MAX_WAGON_CONDITION = 100;
export const MAX_OXEN = 4;
export const MIN_OXEN = 1;

// Pace settings (miles per day base)
export const PACE_SPEEDS: Record<PaceType, number> = {
  [PaceType.Steady]: 15,
  [PaceType.Strenuous]: 20,
  [PaceType.Grueling]: 25,
};

// Pace health effects (per week)
export const PACE_HEALTH_EFFECTS: Record<PaceType, number> = {
  [PaceType.Steady]: 0,
  [PaceType.Strenuous]: -5,
  [PaceType.Grueling]: -10,
};

// Rations settings (lbs per person per day)
export const RATION_AMOUNTS: Record<RationsType, number> = {
  [RationsType.Bare]: 1,
  [RationsType.Meager]: 2,
  [RationsType.Filling]: 3,
};

// Rations health effects (per week)
export const RATION_HEALTH_EFFECTS: Record<RationsType, number> = {
  [RationsType.Bare]: -10,
  [RationsType.Meager]: -2,
  [RationsType.Filling]: 5,
};

// Store prices
export const STORE_PRICES = {
  food: 0.2, // per lb
  ammunition: 2.0, // per box of 20
  medicine: 5.0, // per dose
  spareParts: 10.0, // per set
  oxen: 40.0, // each
};

// Event chances (per day)
export const EVENT_CHANCES: Record<EventType, number> = {
  [EventType.Illness]: 0.05,
  [EventType.Injury]: 0.03,
  [EventType.Weather]: 0.10,
  [EventType.Breakdown]: 0.05,
  [EventType.Theft]: 0.02,
  [EventType.Discovery]: 0.03,
  [EventType.Animal]: 0.05,
};

// Health damage rates (per day)
export const STARVATION_DAMAGE = 20;
export const SICKNESS_DAMAGE = 5;
export const INJURY_DAMAGE = 3;

// Sickness settings
export const SICKNESS_MIN_DAYS = 3;
export const SICKNESS_MAX_DAYS = 7;
export const SICKNESS_SPREAD_CHANCE = 0.2;

// Rest bonus (health per day at landmark)
export const REST_HEALTH_BONUS = 10;

// Weather travel modifiers
export const WEATHER_TRAVEL_MODS: Record<WeatherType, number> = {
  [WeatherType.Clear]: 0,
  [WeatherType.Rain]: -5,
  [WeatherType.Storm]: -10,
  [WeatherType.Snow]: -15,
  [WeatherType.Blizzard]: -999, // Cannot travel
};

// Weather health modifiers (per day)
export const WEATHER_HEALTH_MODS: Record<WeatherType, number> = {
  [WeatherType.Clear]: 0,
  [WeatherType.Rain]: 0,
  [WeatherType.Storm]: -5,
  [WeatherType.Snow]: -10,
  [WeatherType.Blizzard]: -20,
};

// Season weather chances
export const SEASON_WEATHER: Record<string, Record<WeatherType, number>> = {
  spring: {
    [WeatherType.Clear]: 0.5,
    [WeatherType.Rain]: 0.35,
    [WeatherType.Storm]: 0.1,
    [WeatherType.Snow]: 0.05,
    [WeatherType.Blizzard]: 0,
  },
  summer: {
    [WeatherType.Clear]: 0.7,
    [WeatherType.Rain]: 0.2,
    [WeatherType.Storm]: 0.1,
    [WeatherType.Snow]: 0,
    [WeatherType.Blizzard]: 0,
  },
  fall: {
    [WeatherType.Clear]: 0.4,
    [WeatherType.Rain]: 0.35,
    [WeatherType.Storm]: 0.15,
    [WeatherType.Snow]: 0.1,
    [WeatherType.Blizzard]: 0,
  },
  winter: {
    [WeatherType.Clear]: 0.2,
    [WeatherType.Rain]: 0.1,
    [WeatherType.Storm]: 0.1,
    [WeatherType.Snow]: 0.4,
    [WeatherType.Blizzard]: 0.2,
  },
};

// Hunting
export const HUNTING_BASE_SUCCESS = 0.3;
export const HUNTING_AMMO_BONUS = 0.02; // Per round used
export const HUNTING_MAX_FOOD = 100;
export const HUNTING_MIN_FOOD = 10;

// River crossing
export const FORD_BASE_RISK = 0.1; // Per difficulty level
export const CAULK_BASE_RISK = 0.05; // Per difficulty level
export const FERRY_COST_PER_DIFFICULTY = 5;
export const WAIT_DIFFICULTY_REDUCTION = 1;
export const MAX_RIVER_DIFFICULTY = 5;

// Oxen speed modifier
export const OXEN_SPEED_MOD = 0.15; // Per oxen above minimum

// Days per month
export const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
