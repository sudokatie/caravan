import { EventType, GameEvent, EventChoice, EventResult, GameData, Supplies } from './types';
import { EVENT_CHANCES } from './constants';

let nextEventId = 0;

/**
 * Roll for a random event (may return null if no event)
 */
export function rollForEvent(): EventType | null {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const [eventType, chance] of Object.entries(EVENT_CHANCES)) {
    cumulative += chance;
    if (roll < cumulative) {
      return eventType as EventType;
    }
  }
  
  return null;
}

/**
 * Generate event data based on type
 */
export function generateEvent(type: EventType, state: GameData): GameEvent {
  const id = nextEventId++;
  
  switch (type) {
    case EventType.Illness:
      return generateIllnessEvent(id, state);
    case EventType.Injury:
      return generateInjuryEvent(id, state);
    case EventType.Weather:
      return generateWeatherEvent(id);
    case EventType.Breakdown:
      return generateBreakdownEvent(id);
    case EventType.Theft:
      return generateTheftEvent(id, state);
    case EventType.Discovery:
      return generateDiscoveryEvent(id);
    case EventType.Animal:
      return generateAnimalEvent(id);
    default:
      return generateDiscoveryEvent(id);
  }
}

function generateIllnessEvent(id: number, state: GameData): GameEvent {
  const alive = state.party.filter(m => m.status !== 'dead');
  const member = alive[Math.floor(Math.random() * alive.length)];
  const illnesses = ['cholera', 'dysentery', 'typhoid', 'measles'];
  const illness = illnesses[Math.floor(Math.random() * illnesses.length)];
  
  return {
    id,
    type: EventType.Illness,
    title: 'Illness Strikes',
    description: `${member?.name || 'A party member'} has come down with ${illness}!`,
    choices: [
      { id: 0, text: 'Use medicine to treat' },
      { id: 1, text: 'Rest and hope for the best' },
    ],
  };
}

function generateInjuryEvent(id: number, state: GameData): GameEvent {
  const alive = state.party.filter(m => m.status !== 'dead');
  const member = alive[Math.floor(Math.random() * alive.length)];
  const injuries = ['broken arm', 'sprained ankle', 'deep cut', 'snake bite'];
  const injury = injuries[Math.floor(Math.random() * injuries.length)];
  
  return {
    id,
    type: EventType.Injury,
    title: 'Injury',
    description: `${member?.name || 'A party member'} suffered a ${injury}!`,
    choices: [
      { id: 0, text: 'Use medicine to treat' },
      { id: 1, text: 'Bandage it and continue' },
    ],
  };
}

function generateWeatherEvent(id: number): GameEvent {
  const events = [
    { title: 'Sudden Storm', desc: 'A violent storm has damaged your supplies!' },
    { title: 'Flash Flood', desc: 'Rising waters have swept away some of your food!' },
    { title: 'Heavy Winds', desc: 'Strong winds have scattered some supplies!' },
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  
  return {
    id,
    type: EventType.Weather,
    title: event.title,
    description: event.desc,
    choices: [
      { id: 0, text: 'Salvage what you can' },
    ],
  };
}

function generateBreakdownEvent(id: number): GameEvent {
  const parts = ['wagon wheel', 'axle', 'tongue', 'canvas cover'];
  const part = parts[Math.floor(Math.random() * parts.length)];
  
  return {
    id,
    type: EventType.Breakdown,
    title: 'Wagon Trouble',
    description: `The ${part} has broken!`,
    choices: [
      { id: 0, text: 'Use spare parts to repair' },
      { id: 1, text: 'Try a makeshift fix' },
    ],
  };
}

function generateTheftEvent(id: number, state: GameData): GameEvent {
  return {
    id,
    type: EventType.Theft,
    title: 'Thieves in the Night',
    description: 'Someone has raided your supplies while you slept!',
    choices: [
      { id: 0, text: 'Accept the loss' },
    ],
  };
}

function generateDiscoveryEvent(id: number): GameEvent {
  const discoveries = [
    { title: 'Abandoned Wagon', desc: 'You found an abandoned wagon with supplies!' },
    { title: 'Wild Fruit', desc: 'You discovered a patch of wild berries!' },
    { title: 'Helpful Traveler', desc: 'A friendly traveler shares some supplies!' },
    { title: 'Fresh Spring', desc: 'You found a fresh water spring - everyone feels refreshed!' },
  ];
  const discovery = discoveries[Math.floor(Math.random() * discoveries.length)];
  
  return {
    id,
    type: EventType.Discovery,
    title: discovery.title,
    description: discovery.desc,
    choices: [
      { id: 0, text: 'Continue on' },
    ],
  };
}

function generateAnimalEvent(id: number): GameEvent {
  const events = [
    { title: 'Buffalo Stampede', desc: 'A herd of buffalo nearly tramples the wagon!' },
    { title: 'Wild Animals', desc: 'Wolves were spotted near camp last night!' },
    { title: 'Ox Problem', desc: 'One of your oxen has wandered off!' },
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  
  return {
    id,
    type: EventType.Animal,
    title: event.title,
    description: event.desc,
    choices: [
      { id: 0, text: 'Handle the situation' },
    ],
  };
}

/**
 * Apply the result of an event choice
 */
export function applyEventChoice(
  event: GameEvent,
  choiceId: number,
  state: GameData
): EventResult {
  switch (event.type) {
    case EventType.Illness:
      return applyIllnessChoice(choiceId, state);
    case EventType.Injury:
      return applyInjuryChoice(choiceId, state);
    case EventType.Weather:
      return applyWeatherResult(state);
    case EventType.Breakdown:
      return applyBreakdownChoice(choiceId, state);
    case EventType.Theft:
      return applyTheftResult(state);
    case EventType.Discovery:
      return applyDiscoveryResult(state);
    case EventType.Animal:
      return applyAnimalResult(state);
    default:
      return { message: 'You continue on your journey.' };
  }
}

function applyIllnessChoice(choiceId: number, state: GameData): EventResult {
  const alive = state.party.filter(m => m.status !== 'dead');
  
  if (choiceId === 0 && state.supplies.medicine > 0) {
    // Use medicine
    return {
      message: 'The medicine helped! The patient is recovering.',
      supplyChange: { medicine: -1 },
    };
  } else {
    // No medicine or chose to rest
    const victim = alive[Math.floor(Math.random() * alive.length)];
    const healthLoss = new Map<number, number>();
    if (victim) {
      healthLoss.set(victim.id, -20);
    }
    return {
      message: 'Without medicine, the illness takes its toll.',
      healthChange: healthLoss,
      daysLost: 2,
    };
  }
}

function applyInjuryChoice(choiceId: number, state: GameData): EventResult {
  const alive = state.party.filter(m => m.status !== 'dead');
  
  if (choiceId === 0 && state.supplies.medicine > 0) {
    return {
      message: 'The wound is treated properly.',
      supplyChange: { medicine: -1 },
    };
  } else {
    const victim = alive[Math.floor(Math.random() * alive.length)];
    const healthLoss = new Map<number, number>();
    if (victim) {
      healthLoss.set(victim.id, -15);
    }
    return {
      message: 'The injury will slow recovery.',
      healthChange: healthLoss,
      daysLost: 1,
    };
  }
}

function applyWeatherResult(state: GameData): EventResult {
  const foodLoss = Math.floor(Math.random() * 30) + 10;
  return {
    message: `You lost ${foodLoss} lbs of food to the weather.`,
    supplyChange: { food: -foodLoss },
  };
}

function applyBreakdownChoice(choiceId: number, state: GameData): EventResult {
  if (choiceId === 0 && state.supplies.spareParts > 0) {
    return {
      message: 'You used spare parts to fix the wagon.',
      supplyChange: { spareParts: -1 },
    };
  } else {
    // Makeshift fix - wagon takes damage
    return {
      message: 'Your makeshift fix holds, but the wagon is weakened.',
      daysLost: 1,
    };
  }
}

function applyTheftResult(state: GameData): EventResult {
  const foodLoss = Math.floor(Math.random() * 40) + 20;
  const ammoLoss = Math.floor(Math.random() * 20) + 5;
  return {
    message: `Thieves stole ${foodLoss} lbs of food and ${ammoLoss} rounds of ammunition.`,
    supplyChange: { food: -foodLoss, ammunition: -ammoLoss },
  };
}

function applyDiscoveryResult(state: GameData): EventResult {
  const roll = Math.random();
  if (roll < 0.5) {
    const food = Math.floor(Math.random() * 30) + 10;
    return {
      message: `You found ${food} lbs of food!`,
      supplyChange: { food },
    };
  } else if (roll < 0.8) {
    // Health boost
    const healthBoost = new Map<number, number>();
    state.party.forEach(m => {
      if (m.status !== 'dead') {
        healthBoost.set(m.id, 10);
      }
    });
    return {
      message: 'Everyone feels refreshed!',
      healthChange: healthBoost,
    };
  } else {
    const money = Math.floor(Math.random() * 30) + 10;
    return {
      message: `You found $${money}!`,
      supplyChange: { money },
    };
  }
}

function applyAnimalResult(state: GameData): EventResult {
  const roll = Math.random();
  if (roll < 0.3) {
    // Lost an ox
    return {
      message: 'You lost an ox to the wildlife.',
    };
  } else {
    // Minor delay
    return {
      message: 'The situation was handled without major incident.',
      daysLost: Math.random() < 0.5 ? 1 : 0,
    };
  }
}

/**
 * Reset event IDs (for testing)
 */
export function resetEventIds(): void {
  nextEventId = 0;
}
