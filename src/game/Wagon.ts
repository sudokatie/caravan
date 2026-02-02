import { Wagon } from './types';
import {
  MAX_WAGON_CONDITION,
  MAX_OXEN,
  MIN_OXEN,
  STARTING_OXEN,
  OXEN_SPEED_MOD,
} from './constants';

/**
 * Create a new wagon with starting condition and oxen
 */
export function createWagon(): Wagon {
  return {
    condition: MAX_WAGON_CONDITION,
    oxen: STARTING_OXEN,
  };
}

/**
 * Damage the wagon, reducing condition
 * Clamps to minimum of 0
 */
export function damage(wagon: Wagon, amount: number): void {
  wagon.condition = Math.max(0, wagon.condition - amount);
}

/**
 * Repair the wagon using spare parts
 * Returns true if repair was successful, false if already at max
 */
export function repair(wagon: Wagon, fullRepair: boolean = false): number {
  const repairAmount = fullRepair ? MAX_WAGON_CONDITION : 25;
  const previousCondition = wagon.condition;
  wagon.condition = Math.min(MAX_WAGON_CONDITION, wagon.condition + repairAmount);
  return wagon.condition - previousCondition;
}

/**
 * Add an ox to the wagon
 * Returns true if successful, false if at max
 */
export function addOxen(wagon: Wagon): boolean {
  if (wagon.oxen >= MAX_OXEN) {
    return false;
  }
  wagon.oxen++;
  return true;
}

/**
 * Remove an ox from the wagon
 * Returns true if successful, false if at minimum
 */
export function removeOxen(wagon: Wagon): boolean {
  if (wagon.oxen <= MIN_OXEN) {
    return false;
  }
  wagon.oxen--;
  return true;
}

/**
 * Lose an ox (dies or is stolen) - can go below minimum
 * Returns true if there was an ox to lose
 */
export function loseOxen(wagon: Wagon): boolean {
  if (wagon.oxen <= 0) {
    return false;
  }
  wagon.oxen--;
  return true;
}

/**
 * Get the speed modifier based on oxen count
 * More oxen = faster travel
 * Returns multiplier (1.0 = normal, > 1.0 = faster)
 */
export function getSpeedModifier(wagon: Wagon): number {
  if (wagon.oxen < MIN_OXEN) {
    return 0; // Cannot travel without minimum oxen
  }
  const extraOxen = wagon.oxen - MIN_OXEN;
  return 1 + (extraOxen * OXEN_SPEED_MOD);
}

/**
 * Check if wagon is broken (cannot travel)
 */
export function isBroken(wagon: Wagon): boolean {
  return wagon.condition <= 0;
}

/**
 * Check if wagon can travel (not broken and has minimum oxen)
 */
export function canTravel(wagon: Wagon): boolean {
  return !isBroken(wagon) && wagon.oxen >= MIN_OXEN;
}

/**
 * Get wagon condition as a percentage
 */
export function getConditionPercent(wagon: Wagon): number {
  return Math.round((wagon.condition / MAX_WAGON_CONDITION) * 100);
}

/**
 * Get condition description for display
 */
export function getConditionStatus(wagon: Wagon): string {
  const percent = getConditionPercent(wagon);
  if (percent === 0) return 'Broken';
  if (percent <= 25) return 'Poor';
  if (percent <= 50) return 'Fair';
  if (percent <= 75) return 'Good';
  return 'Excellent';
}
