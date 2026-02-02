import { Supplies, RationsType } from './types';
import {
  STARTING_MONEY,
  STARTING_FOOD,
  STARTING_AMMO,
  STARTING_MEDICINE,
  STARTING_PARTS,
  RATION_AMOUNTS,
} from './constants';

// Create initial supplies
export function createSupplies(): Supplies {
  return {
    food: STARTING_FOOD,
    ammunition: STARTING_AMMO,
    medicine: STARTING_MEDICINE,
    spareParts: STARTING_PARTS,
    money: STARTING_MONEY,
  };
}

// Create empty supplies (for testing)
export function createEmptySupplies(): Supplies {
  return {
    food: 0,
    ammunition: 0,
    medicine: 0,
    spareParts: 0,
    money: 0,
  };
}

// Consume food, returns false if not enough
export function consumeFood(supplies: Supplies, amount: number): boolean {
  if (supplies.food < amount) return false;
  supplies.food -= amount;
  return true;
}

// Use ammunition, returns false if not enough
export function useAmmo(supplies: Supplies, amount: number): boolean {
  if (supplies.ammunition < amount) return false;
  supplies.ammunition -= amount;
  return true;
}

// Use one dose of medicine, returns false if none left
export function useMedicine(supplies: Supplies): boolean {
  if (supplies.medicine < 1) return false;
  supplies.medicine -= 1;
  return true;
}

// Use one set of spare parts, returns false if none left
export function useParts(supplies: Supplies): boolean {
  if (supplies.spareParts < 1) return false;
  supplies.spareParts -= 1;
  return true;
}

// Spend money, returns false if not enough
export function spendMoney(supplies: Supplies, amount: number): boolean {
  if (supplies.money < amount) return false;
  supplies.money -= amount;
  return true;
}

// Add to a supply type
export function addSupplies(
  supplies: Supplies,
  type: keyof Supplies,
  amount: number
): void {
  supplies[type] += amount;
}

// Check if enough of a supply exists
export function hasEnough(
  supplies: Supplies,
  type: keyof Supplies,
  amount: number
): boolean {
  return supplies[type] >= amount;
}

// Calculate daily food consumption for party
export function getDailyFoodNeed(
  partySize: number,
  rations: RationsType
): number {
  return partySize * RATION_AMOUNTS[rations];
}

// Check if party can eat for the day
export function canFeedParty(
  supplies: Supplies,
  partySize: number,
  rations: RationsType
): boolean {
  const needed = getDailyFoodNeed(partySize, rations);
  return supplies.food >= needed;
}

// Feed the party for a day, returns shortfall (0 if fully fed)
export function feedParty(
  supplies: Supplies,
  partySize: number,
  rations: RationsType
): number {
  const needed = getDailyFoodNeed(partySize, rations);
  if (supplies.food >= needed) {
    supplies.food -= needed;
    return 0;
  }
  const shortfall = needed - supplies.food;
  supplies.food = 0;
  return shortfall;
}

// Get total supply value (for scoring)
export function getSupplyValue(supplies: Supplies): number {
  return (
    supplies.food * 0.2 +
    supplies.ammunition * 0.1 +
    supplies.medicine * 5 +
    supplies.spareParts * 10 +
    supplies.money
  );
}

// Clone supplies (for state management)
export function cloneSupplies(supplies: Supplies): Supplies {
  return { ...supplies };
}
