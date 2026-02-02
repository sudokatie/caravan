import { Supplies, PartyMember, RiverResult } from './types';
import {
  FORD_BASE_RISK,
  CAULK_BASE_RISK,
  FERRY_COST_PER_DIFFICULTY,
  WAIT_DIFFICULTY_REDUCTION,
} from './constants';

/**
 * Calculate ford risk based on difficulty
 * Higher difficulty = higher chance of disaster
 */
export function calculateFordRisk(difficulty: number): number {
  return Math.min(1, difficulty * FORD_BASE_RISK);
}

/**
 * Calculate caulk and float risk
 * Lower than ford but still risky
 */
export function calculateCaulkRisk(difficulty: number): number {
  return Math.min(1, difficulty * CAULK_BASE_RISK);
}

/**
 * Calculate ferry cost based on difficulty
 * Capped at $20 per spec (difficulty 1-5 = $5-20)
 */
export function calculateFerryCost(difficulty: number): number {
  const cost = difficulty * FERRY_COST_PER_DIFFICULTY;
  return Math.min(cost, 20); // Cap at $20 per spec
}

/**
 * Check if can afford ferry
 */
export function canAffordFerry(money: number, difficulty: number): boolean {
  return money >= calculateFerryCost(difficulty);
}

/**
 * Check if have spare parts for caulking
 */
export function canCaulk(spareParts: number): boolean {
  return spareParts >= 1;
}

/**
 * Random helper
 */
function rollDice(): number {
  return Math.random();
}

/**
 * Determine what's lost in a disaster
 */
function calculateDisasterLoss(
  severity: 'minor' | 'major' | 'catastrophic',
  supplies: Supplies,
  party: PartyMember[]
): { suppliesLost: Partial<Supplies>; membersLost: number[] } {
  const suppliesLost: Partial<Supplies> = {};
  const membersLost: number[] = [];

  if (severity === 'minor') {
    // Lose some food
    suppliesLost.food = Math.floor(supplies.food * 0.1);
  } else if (severity === 'major') {
    // Lose significant supplies
    suppliesLost.food = Math.floor(supplies.food * 0.25);
    suppliesLost.ammunition = Math.floor(supplies.ammunition * 0.25);
  } else {
    // Catastrophic - lose supplies and potentially a party member
    suppliesLost.food = Math.floor(supplies.food * 0.5);
    suppliesLost.ammunition = Math.floor(supplies.ammunition * 0.5);
    suppliesLost.spareParts = Math.floor(supplies.spareParts * 0.5);

    // 50% chance to lose a party member
    if (rollDice() < 0.5) {
      const aliveMembers = party.filter(p => p.status !== 'dead');
      if (aliveMembers.length > 0) {
        const victim = aliveMembers[Math.floor(rollDice() * aliveMembers.length)];
        membersLost.push(victim.id);
      }
    }
  }

  return { suppliesLost, membersLost };
}

/**
 * Ford the river (free but risky)
 */
export function ford(
  difficulty: number,
  supplies: Supplies,
  party: PartyMember[],
  random: () => number = rollDice
): RiverResult {
  const risk = calculateFordRisk(difficulty);
  const roll = random();

  if (roll > risk) {
    return {
      success: true,
      message: 'You successfully forded the river.',
    };
  }

  // Disaster! Determine severity
  const severityRoll = random();
  let severity: 'minor' | 'major' | 'catastrophic';
  if (severityRoll < 0.5) {
    severity = 'minor';
  } else if (severityRoll < 0.85) {
    severity = 'major';
  } else {
    severity = 'catastrophic';
  }

  const { suppliesLost, membersLost } = calculateDisasterLoss(severity, supplies, party);

  let message = '';
  if (severity === 'minor') {
    message = 'The crossing was rough. You lost some supplies.';
  } else if (severity === 'major') {
    message = 'The wagon nearly capsized! You lost significant supplies.';
  } else {
    message = 'Disaster! The wagon overturned in the river.';
    if (membersLost.length > 0) {
      message += ' Someone drowned.';
    }
  }

  return {
    success: false,
    message,
    suppliesLost,
    membersLost: membersLost.length > 0 ? membersLost : undefined,
  };
}

/**
 * Caulk the wagon and float across (uses spare parts)
 */
export function caulkAndFloat(
  difficulty: number,
  supplies: Supplies,
  party: PartyMember[],
  random: () => number = rollDice
): RiverResult {
  if (!canCaulk(supplies.spareParts)) {
    return {
      success: false,
      message: 'You need spare parts to caulk the wagon.',
    };
  }

  const risk = calculateCaulkRisk(difficulty);
  const roll = random();

  // Always consume spare parts
  const suppliesUsed: Partial<Supplies> = { spareParts: 1 };

  if (roll > risk) {
    return {
      success: true,
      message: 'You successfully floated across the river.',
      suppliesLost: suppliesUsed,
    };
  }

  // Failed but less severe than ford
  const severityRoll = random();
  let severity: 'minor' | 'major' | 'catastrophic';
  if (severityRoll < 0.6) {
    severity = 'minor';
  } else if (severityRoll < 0.95) {
    severity = 'major';
  } else {
    severity = 'catastrophic';
  }

  const { suppliesLost, membersLost } = calculateDisasterLoss(severity, supplies, party);

  // Add the spare parts used
  suppliesLost.spareParts = (suppliesLost.spareParts || 0) + 1;

  let message = '';
  if (severity === 'minor') {
    message = 'The floating was unstable. You lost some supplies.';
  } else if (severity === 'major') {
    message = 'The wagon took on water! You lost significant supplies.';
  } else {
    message = 'The wagon sank! You barely escaped.';
    if (membersLost.length > 0) {
      message += ' Someone drowned.';
    }
  }

  return {
    success: false,
    message,
    suppliesLost,
    membersLost: membersLost.length > 0 ? membersLost : undefined,
  };
}

/**
 * Take the ferry (costs money but safe)
 */
export function takeFerry(
  difficulty: number,
  money: number
): RiverResult {
  const cost = calculateFerryCost(difficulty);

  if (!canAffordFerry(money, difficulty)) {
    return {
      success: false,
      message: `You need $${cost} for the ferry.`,
    };
  }

  return {
    success: true,
    message: `You paid $${cost} and crossed safely on the ferry.`,
    suppliesLost: { money: cost },
  };
}

/**
 * Wait for better conditions (lose days, reduce difficulty)
 */
export function wait(
  currentDifficulty: number,
  daysToWait: number = 3
): { newDifficulty: number; daysLost: number; message: string } {
  const reduction = Math.min(
    currentDifficulty - 1,
    daysToWait * WAIT_DIFFICULTY_REDUCTION
  );
  const newDifficulty = Math.max(1, currentDifficulty - reduction);

  let message = '';
  if (reduction > 0) {
    message = `After ${daysToWait} days, the river conditions improved.`;
  } else {
    message = `After ${daysToWait} days, conditions are unchanged.`;
  }

  return {
    newDifficulty,
    daysLost: daysToWait,
    message,
  };
}

/**
 * Get all crossing options for UI display
 */
export function getCrossingOptions(
  difficulty: number,
  supplies: Supplies
): {
  ford: { available: boolean; risk: number };
  caulk: { available: boolean; risk: number };
  ferry: { available: boolean; cost: number };
  wait: { available: boolean; daysLost: number };
} {
  return {
    ford: {
      available: true,
      risk: Math.round(calculateFordRisk(difficulty) * 100),
    },
    caulk: {
      available: canCaulk(supplies.spareParts),
      risk: Math.round(calculateCaulkRisk(difficulty) * 100),
    },
    ferry: {
      available: canAffordFerry(supplies.money, difficulty),
      cost: calculateFerryCost(difficulty),
    },
    wait: {
      available: difficulty > 1,
      daysLost: 3,
    },
  };
}
