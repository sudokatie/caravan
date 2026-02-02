import { PaceType, WeatherType, Location, PartyMember, Wagon, Supplies } from './types';
import {
  PACE_SPEEDS,
  WEATHER_TRAVEL_MODS,
  OXEN_SPEED_MOD,
  MIN_OXEN,
  DAYS_PER_MONTH,
} from './constants';
import { ROUTE, getNextLocation, getDistanceToNext, isDestination } from './locations';

/**
 * Calculate daily travel distance based on pace, weather, wagon, and oxen
 */
export function calculateDailyDistance(
  pace: PaceType,
  weather: WeatherType,
  wagon: Wagon
): number {
  // Blizzard = cannot travel
  if (weather === WeatherType.Blizzard) {
    return 0;
  }

  // Base speed from pace
  let distance = PACE_SPEEDS[pace];

  // Weather modifier
  distance += WEATHER_TRAVEL_MODS[weather];

  // Oxen bonus (extra speed for oxen above minimum)
  const extraOxen = wagon.oxen - MIN_OXEN;
  if (extraOxen > 0) {
    distance += distance * extraOxen * OXEN_SPEED_MOD;
  }

  // Wagon condition modifier (broken wagon = half speed)
  if (wagon.condition <= 0) {
    distance = Math.floor(distance * 0.5);
  } else if (wagon.condition < 50) {
    distance = Math.floor(distance * 0.75);
  }

  // Minimum 0
  return Math.max(0, Math.floor(distance));
}

/**
 * Date tracking interface
 */
export interface DateState {
  day: number;
  month: number;
  year: number;
}

/**
 * Advance the date by one day
 */
export function advanceDay(date: DateState): DateState {
  let { day, month, year } = date;

  day++;

  // Check if we need to advance the month
  const daysInMonth = DAYS_PER_MONTH[month - 1];
  if (day > daysInMonth) {
    day = 1;
    month++;

    // Check if we need to advance the year
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return { day, month, year };
}

/**
 * Travel result for a single day
 */
export interface TravelDayResult {
  distanceTraveled: number;
  newTotalDistance: number;
  reachedLocation: Location | null;
  newLocationIndex: number;
}

/**
 * Process one day of travel
 */
export function travelOneDay(
  currentDistance: number,
  currentLocationIndex: number,
  pace: PaceType,
  weather: WeatherType,
  wagon: Wagon
): TravelDayResult {
  const dailyDistance = calculateDailyDistance(pace, weather, wagon);
  const newTotalDistance = currentDistance + dailyDistance;

  // Check if we've reached the next location
  let reachedLocation: Location | null = null;
  let newLocationIndex = currentLocationIndex;

  const nextLocation = getNextLocation(currentLocationIndex);
  if (nextLocation && newTotalDistance >= nextLocation.distanceFromStart) {
    reachedLocation = nextLocation;
    newLocationIndex = currentLocationIndex + 1;
  }

  return {
    distanceTraveled: dailyDistance,
    newTotalDistance,
    reachedLocation,
    newLocationIndex,
  };
}

/**
 * Check if party can continue traveling
 */
export function canContinue(
  party: PartyMember[],
  supplies: Supplies,
  wagon: Wagon,
  locationIndex: number
): { canTravel: boolean; reason: string | null } {
  // Check if anyone is alive
  const aliveMembers = party.filter(p => p.status !== 'dead');
  if (aliveMembers.length === 0) {
    return { canTravel: false, reason: 'All party members have died.' };
  }

  // Check if at destination
  if (isDestination(locationIndex)) {
    return { canTravel: false, reason: 'You have reached your destination!' };
  }

  // Check for food
  if (supplies.food <= 0) {
    // Can still travel, but will take starvation damage
    return { canTravel: true, reason: null };
  }

  // Check for oxen
  if (wagon.oxen <= 0) {
    return { canTravel: false, reason: 'You have no oxen to pull the wagon.' };
  }

  return { canTravel: true, reason: null };
}

/**
 * Get distance remaining to destination
 */
export function getDistanceRemaining(distanceTraveled: number): number {
  const destination = ROUTE[ROUTE.length - 1];
  return Math.max(0, destination.distanceFromStart - distanceTraveled);
}

/**
 * Get distance to next location
 */
export function getDistanceToNextLocation(
  currentLocationIndex: number,
  distanceTraveled: number
): number {
  return getDistanceToNext(currentLocationIndex, distanceTraveled);
}

/**
 * Estimate days to reach next location
 */
export function estimateDaysToNext(
  currentLocationIndex: number,
  distanceTraveled: number,
  pace: PaceType,
  wagon: Wagon
): number {
  const distance = getDistanceToNext(currentLocationIndex, distanceTraveled);
  const dailyRate = calculateDailyDistance(pace, WeatherType.Clear, wagon);
  if (dailyRate <= 0) return 999;
  return Math.ceil(distance / dailyRate);
}
