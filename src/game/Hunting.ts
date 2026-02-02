import { HuntingResult } from './types';
import {
  HUNTING_BASE_SUCCESS,
  HUNTING_AMMO_BONUS,
  HUNTING_MAX_FOOD,
  HUNTING_MIN_FOOD,
} from './constants';

/**
 * Calculate hunting success chance based on ammo used
 * More ammo = higher chance, but diminishing returns
 */
export function calculateSuccessChance(ammoUsed: number): number {
  // Base chance + bonus per round (with diminishing returns)
  const bonus = Math.min(ammoUsed, 20) * HUNTING_AMMO_BONUS;
  return Math.min(0.9, HUNTING_BASE_SUCCESS + bonus);
}

/**
 * Calculate food gained from a successful hunt
 * Random amount between min and max
 */
export function calculateFoodGained(random: () => number = Math.random): number {
  const range = HUNTING_MAX_FOOD - HUNTING_MIN_FOOD;
  return Math.floor(HUNTING_MIN_FOOD + random() * range);
}

/**
 * Check if player has enough ammo to hunt
 */
export function canHunt(ammunition: number, ammoToUse: number): boolean {
  return ammunition >= ammoToUse && ammoToUse >= 1;
}

/**
 * Perform a hunting attempt
 */
export function hunt(
  ammoToUse: number,
  currentAmmo: number,
  random: () => number = Math.random
): HuntingResult {
  // Validate
  if (!canHunt(currentAmmo, ammoToUse)) {
    return {
      ammoUsed: 0,
      foodGained: 0,
      message: 'Not enough ammunition to hunt.',
    };
  }

  // Calculate success
  const successChance = calculateSuccessChance(ammoToUse);
  const roll = random();

  if (roll > successChance) {
    // Failed hunt
    return {
      ammoUsed: ammoToUse,
      foodGained: 0,
      message: 'The hunt was unsuccessful. The animals escaped.',
    };
  }

  // Successful hunt - calculate food
  const foodGained = calculateFoodGained(random);

  // Generate flavor message based on amount
  let message: string;
  if (foodGained >= 80) {
    message = `Excellent hunt! You bagged ${foodGained} pounds of meat.`;
  } else if (foodGained >= 50) {
    message = `Good hunt! You brought back ${foodGained} pounds of meat.`;
  } else {
    message = `Modest hunt. You gathered ${foodGained} pounds of meat.`;
  }

  return {
    ammoUsed: ammoToUse,
    foodGained,
    message,
  };
}

/**
 * Get recommended ammo amount based on current supplies
 */
export function getRecommendedAmmo(currentAmmo: number): number {
  // If very low on ammo, use what we have
  if (currentAmmo <= 5) {
    return currentAmmo;
  }
  // Recommend using 10% of ammo, minimum 5, maximum 20
  const recommended = Math.floor(currentAmmo * 0.1);
  return Math.max(5, Math.min(20, recommended));
}

/**
 * Calculate expected food gain for a given ammo investment
 * Useful for UI display
 */
export function getExpectedFood(ammoToUse: number): { min: number; max: number; chance: number } {
  const chance = Math.round(calculateSuccessChance(ammoToUse) * 100);
  return {
    min: HUNTING_MIN_FOOD,
    max: HUNTING_MAX_FOOD,
    chance,
  };
}
