import { PartyMember, PartyStatus, PaceType, RationsType } from './types';
import {
  MAX_HEALTH,
  STARTING_HEALTH,
  PACE_HEALTH_EFFECTS,
  RATION_HEALTH_EFFECTS,
  SICKNESS_DAMAGE,
  INJURY_DAMAGE,
  SICKNESS_MIN_DAYS,
  SICKNESS_MAX_DAYS,
  SICKNESS_SPREAD_CHANCE,
} from './constants';

let nextMemberId = 0;

// Create a new party from a list of names
export function createParty(names: string[]): PartyMember[] {
  return names.map(name => ({
    id: nextMemberId++,
    name,
    health: STARTING_HEALTH,
    status: 'healthy' as PartyStatus,
    sicknessTurns: 0,
  }));
}

// Reset member IDs (for testing)
export function resetMemberIds(): void {
  nextMemberId = 0;
}

// Get a member by ID
export function getMember(party: PartyMember[], id: number): PartyMember | undefined {
  return party.find(m => m.id === id);
}

// Get alive members
export function getAliveMembers(party: PartyMember[]): PartyMember[] {
  return party.filter(m => m.status !== 'dead');
}

// Get alive count
export function getAliveCount(party: PartyMember[]): number {
  return getAliveMembers(party).length;
}

// Check if party has any survivors
export function isPartyAlive(party: PartyMember[]): boolean {
  return getAliveCount(party) > 0;
}

// Clamp health to valid range
function clampHealth(health: number): number {
  return Math.max(0, Math.min(MAX_HEALTH, health));
}

// Update a member's health
export function updateHealth(party: PartyMember[], id: number, delta: number): void {
  const member = getMember(party, id);
  if (!member || member.status === 'dead') return;

  member.health = clampHealth(member.health + delta);

  // Check for death
  if (member.health <= 0) {
    member.status = 'dead';
    member.health = 0;
  }
}

// Set member status
export function setStatus(
  party: PartyMember[],
  id: number,
  status: PartyStatus
): void {
  const member = getMember(party, id);
  if (!member || member.status === 'dead') return;

  member.status = status;

  // Set sickness duration when becoming sick
  if (status === 'sick' && member.sicknessTurns === 0) {
    member.sicknessTurns =
      SICKNESS_MIN_DAYS + Math.floor(Math.random() * (SICKNESS_MAX_DAYS - SICKNESS_MIN_DAYS + 1));
  }

  // Clear sickness turns when healed
  if (status === 'healthy') {
    member.sicknessTurns = 0;
  }
}

// Heal a member using medicine (cures sickness)
export function healMember(party: PartyMember[], id: number): boolean {
  const member = getMember(party, id);
  if (!member || member.status === 'dead') return false;
  if (member.status !== 'sick') return false;

  member.status = 'healthy';
  member.sicknessTurns = 0;
  return true;
}

// Make a random alive member sick
export function makeRandomMemberSick(party: PartyMember[]): PartyMember | null {
  const healthy = party.filter(m => m.status === 'healthy');
  if (healthy.length === 0) return null;

  const victim = healthy[Math.floor(Math.random() * healthy.length)];
  setStatus(party, victim.id, 'sick');
  return victim;
}

// Make a random alive member injured
export function makeRandomMemberInjured(party: PartyMember[]): PartyMember | null {
  const canBeInjured = party.filter(m => m.status === 'healthy' || m.status === 'sick');
  if (canBeInjured.length === 0) return null;

  const victim = canBeInjured[Math.floor(Math.random() * canBeInjured.length)];
  setStatus(party, victim.id, 'injured');
  return victim;
}

// Apply daily effects from rations, pace, and ailments
export function applyDailyEffects(
  party: PartyMember[],
  rations: RationsType,
  pace: PaceType,
  dayOfWeek: number
): string[] {
  const messages: string[] = [];

  for (const member of party) {
    if (member.status === 'dead') continue;

    // Apply weekly pace and ration effects on day 7 (once per week)
    if (dayOfWeek === 7) {
      const paceEffect = PACE_HEALTH_EFFECTS[pace];
      const rationEffect = RATION_HEALTH_EFFECTS[rations];
      updateHealth(party, member.id, paceEffect + rationEffect);
    }

    // Process sickness
    if (member.status === 'sick') {
      updateHealth(party, member.id, -SICKNESS_DAMAGE);
      member.sicknessTurns--;

      // Check for natural recovery
      if (member.sicknessTurns <= 0 && member.status === 'sick') {
        member.status = 'healthy';
        member.sicknessTurns = 0;
        messages.push(`${member.name} has recovered from illness.`);
      }

      // Check for spreading
      if (Math.random() < SICKNESS_SPREAD_CHANCE) {
        const newSick = party.find(
          m => m.id !== member.id && m.status === 'healthy'
        );
        if (newSick) {
          setStatus(party, newSick.id, 'sick');
          messages.push(`${newSick.name} has caught the illness.`);
        }
      }
    }

    // Process injury
    if (member.status === 'injured') {
      updateHealth(party, member.id, -INJURY_DAMAGE);
    }

    // Check for death (updateHealth already sets status='dead', but we add the message here)
    if (member.health <= 0) {
      messages.push(`${member.name} has died.`);
    }
  }

  return messages;
}

// Get party's total health percentage
export function getPartyHealthPercent(party: PartyMember[]): number {
  const alive = getAliveMembers(party);
  if (alive.length === 0) return 0;
  const total = alive.reduce((sum, m) => sum + m.health, 0);
  return Math.round((total / (alive.length * MAX_HEALTH)) * 100);
}
