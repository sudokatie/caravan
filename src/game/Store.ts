import { Supplies } from './types';
import { STORE_PRICES } from './constants';

/**
 * Item types available in the store
 */
export type StoreItem = 'food' | 'ammunition' | 'medicine' | 'spareParts' | 'oxen';

/**
 * Get the price of an item
 */
export function getPrice(item: StoreItem): number {
  switch (item) {
    case 'food':
      return STORE_PRICES.food; // per lb
    case 'ammunition':
      return STORE_PRICES.ammunition; // per box of 20
    case 'medicine':
      return STORE_PRICES.medicine; // per dose
    case 'spareParts':
      return STORE_PRICES.spareParts; // per set
    case 'oxen':
      return STORE_PRICES.oxen; // each
  }
}

/**
 * Get unit label for display
 */
export function getUnit(item: StoreItem): string {
  switch (item) {
    case 'food':
      return 'lb';
    case 'ammunition':
      return 'box (20)';
    case 'medicine':
      return 'dose';
    case 'spareParts':
      return 'set';
    case 'oxen':
      return 'ox';
  }
}

/**
 * Calculate cost for a given quantity
 */
export function calculateCost(item: StoreItem, quantity: number): number {
  return getPrice(item) * quantity;
}

/**
 * Check if player can afford a purchase
 */
export function canAfford(money: number, item: StoreItem, quantity: number): boolean {
  return money >= calculateCost(item, quantity);
}

/**
 * Buy an item - returns the supply changes
 */
export function buy(
  item: StoreItem,
  quantity: number,
  currentMoney: number
): { success: boolean; cost: number; message: string } {
  const cost = calculateCost(item, quantity);

  if (!canAfford(currentMoney, item, quantity)) {
    return {
      success: false,
      cost: 0,
      message: `Not enough money. Need $${cost.toFixed(2)}.`,
    };
  }

  if (quantity <= 0) {
    return {
      success: false,
      cost: 0,
      message: 'Invalid quantity.',
    };
  }

  return {
    success: true,
    cost,
    message: `Purchased ${quantity} ${getUnit(item)}${quantity > 1 ? 's' : ''} for $${cost.toFixed(2)}.`,
  };
}

/**
 * Calculate how much an item sells for (50% of buy price)
 */
export function getSellPrice(item: StoreItem): number {
  return getPrice(item) * 0.5;
}

/**
 * Sell an item - returns the money gained
 */
export function sell(
  item: StoreItem,
  quantity: number,
  currentQuantity: number
): { success: boolean; revenue: number; message: string } {
  if (quantity <= 0) {
    return {
      success: false,
      revenue: 0,
      message: 'Invalid quantity.',
    };
  }

  if (quantity > currentQuantity) {
    return {
      success: false,
      revenue: 0,
      message: `You only have ${currentQuantity} to sell.`,
    };
  }

  const revenue = getSellPrice(item) * quantity;

  return {
    success: true,
    revenue,
    message: `Sold ${quantity} ${getUnit(item)}${quantity > 1 ? 's' : ''} for $${revenue.toFixed(2)}.`,
  };
}

/**
 * Get maximum quantity that can be purchased with given money
 */
export function getMaxPurchase(money: number, item: StoreItem): number {
  const price = getPrice(item);
  return Math.floor(money / price);
}

/**
 * Apply a purchase to supplies
 */
export function applyPurchase(
  supplies: Supplies,
  item: StoreItem,
  quantity: number
): Supplies {
  const cost = calculateCost(item, quantity);
  const updated = { ...supplies, money: supplies.money - cost };

  switch (item) {
    case 'food':
      updated.food += quantity;
      break;
    case 'ammunition':
      updated.ammunition += quantity * 20; // 20 rounds per box
      break;
    case 'medicine':
      updated.medicine += quantity;
      break;
    case 'spareParts':
      updated.spareParts += quantity;
      break;
    // oxen handled separately in wagon
  }

  return updated;
}

/**
 * Apply a sale to supplies
 */
export function applySale(
  supplies: Supplies,
  item: StoreItem,
  quantity: number
): Supplies {
  const revenue = getSellPrice(item) * quantity;
  const updated = { ...supplies, money: supplies.money + revenue };

  switch (item) {
    case 'food':
      updated.food -= quantity;
      break;
    case 'ammunition':
      updated.ammunition -= quantity * 20;
      break;
    case 'medicine':
      updated.medicine -= quantity;
      break;
    case 'spareParts':
      updated.spareParts -= quantity;
      break;
  }

  return updated;
}

/**
 * Get all store items with prices for UI
 */
export function getStoreInventory(): { item: StoreItem; price: number; unit: string }[] {
  const items: StoreItem[] = ['food', 'ammunition', 'medicine', 'spareParts', 'oxen'];
  return items.map(item => ({
    item,
    price: getPrice(item),
    unit: getUnit(item),
  }));
}
