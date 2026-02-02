import {
  createParty,
  resetMemberIds,
  getMember,
  getAliveMembers,
  getAliveCount,
  isPartyAlive,
  updateHealth,
  setStatus,
  healMember,
  makeRandomMemberSick,
  applyDailyEffects,
  getPartyHealthPercent,
} from '../game/Party';
import { PaceType, RationsType } from '../game/types';
import { STARTING_HEALTH, MAX_HEALTH } from '../game/constants';

describe('Party', () => {
  beforeEach(() => {
    resetMemberIds();
  });

  describe('createParty', () => {
    it('creates party with correct number of members', () => {
      const party = createParty(['Alice', 'Bob', 'Charlie']);
      expect(party.length).toBe(3);
    });

    it('assigns unique IDs to members', () => {
      const party = createParty(['Alice', 'Bob']);
      expect(party[0].id).toBe(0);
      expect(party[1].id).toBe(1);
    });

    it('initializes members with starting health', () => {
      const party = createParty(['Alice']);
      expect(party[0].health).toBe(STARTING_HEALTH);
    });

    it('initializes members as healthy', () => {
      const party = createParty(['Alice']);
      expect(party[0].status).toBe('healthy');
    });

    it('assigns correct names', () => {
      const party = createParty(['Alice', 'Bob']);
      expect(party[0].name).toBe('Alice');
      expect(party[1].name).toBe('Bob');
    });
  });

  describe('getMember', () => {
    it('finds member by ID', () => {
      const party = createParty(['Alice', 'Bob']);
      const member = getMember(party, 1);
      expect(member?.name).toBe('Bob');
    });

    it('returns undefined for invalid ID', () => {
      const party = createParty(['Alice']);
      expect(getMember(party, 99)).toBeUndefined();
    });
  });

  describe('getAliveMembers', () => {
    it('returns all members when all alive', () => {
      const party = createParty(['Alice', 'Bob']);
      expect(getAliveMembers(party).length).toBe(2);
    });

    it('excludes dead members', () => {
      const party = createParty(['Alice', 'Bob']);
      party[0].status = 'dead';
      expect(getAliveMembers(party).length).toBe(1);
    });
  });

  describe('getAliveCount', () => {
    it('counts alive members', () => {
      const party = createParty(['Alice', 'Bob', 'Charlie']);
      expect(getAliveCount(party)).toBe(3);
      party[0].status = 'dead';
      expect(getAliveCount(party)).toBe(2);
    });
  });

  describe('isPartyAlive', () => {
    it('returns true when members alive', () => {
      const party = createParty(['Alice']);
      expect(isPartyAlive(party)).toBe(true);
    });

    it('returns false when all dead', () => {
      const party = createParty(['Alice']);
      party[0].status = 'dead';
      expect(isPartyAlive(party)).toBe(false);
    });
  });

  describe('updateHealth', () => {
    it('increases health', () => {
      const party = createParty(['Alice']);
      party[0].health = 50;
      updateHealth(party, 0, 10);
      expect(party[0].health).toBe(60);
    });

    it('decreases health', () => {
      const party = createParty(['Alice']);
      updateHealth(party, 0, -20);
      expect(party[0].health).toBe(80);
    });

    it('clamps health to max', () => {
      const party = createParty(['Alice']);
      updateHealth(party, 0, 50);
      expect(party[0].health).toBe(MAX_HEALTH);
    });

    it('clamps health to zero', () => {
      const party = createParty(['Alice']);
      updateHealth(party, 0, -200);
      expect(party[0].health).toBe(0);
    });

    it('sets status to dead when health reaches zero', () => {
      const party = createParty(['Alice']);
      updateHealth(party, 0, -200);
      expect(party[0].status).toBe('dead');
    });

    it('does not update dead members', () => {
      const party = createParty(['Alice']);
      party[0].status = 'dead';
      party[0].health = 0;
      updateHealth(party, 0, 50);
      expect(party[0].health).toBe(0);
    });
  });

  describe('setStatus', () => {
    it('sets status correctly', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'sick');
      expect(party[0].status).toBe('sick');
    });

    it('sets sickness duration when becoming sick', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'sick');
      expect(party[0].sicknessTurns).toBeGreaterThan(0);
    });

    it('clears sickness turns when healed', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'sick');
      setStatus(party, 0, 'healthy');
      expect(party[0].sicknessTurns).toBe(0);
    });

    it('does not update dead members', () => {
      const party = createParty(['Alice']);
      party[0].status = 'dead';
      setStatus(party, 0, 'healthy');
      expect(party[0].status).toBe('dead');
    });
  });

  describe('healMember', () => {
    it('heals sick member', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'sick');
      const result = healMember(party, 0);
      expect(result).toBe(true);
      expect(party[0].status).toBe('healthy');
    });

    it('returns false for healthy member', () => {
      const party = createParty(['Alice']);
      const result = healMember(party, 0);
      expect(result).toBe(false);
    });

    it('returns false for dead member', () => {
      const party = createParty(['Alice']);
      party[0].status = 'dead';
      const result = healMember(party, 0);
      expect(result).toBe(false);
    });
  });

  describe('makeRandomMemberSick', () => {
    it('makes a healthy member sick', () => {
      const party = createParty(['Alice', 'Bob']);
      const victim = makeRandomMemberSick(party);
      expect(victim).not.toBeNull();
      expect(victim?.status).toBe('sick');
    });

    it('returns null when no healthy members', () => {
      const party = createParty(['Alice']);
      party[0].status = 'sick';
      const result = makeRandomMemberSick(party);
      expect(result).toBeNull();
    });
  });

  describe('applyDailyEffects', () => {
    it('damages sick members', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'sick');
      party[0].sicknessTurns = 5;
      const startHealth = party[0].health;
      applyDailyEffects(party, RationsType.Filling, PaceType.Steady, 1);
      expect(party[0].health).toBeLessThan(startHealth);
    });

    it('damages injured members', () => {
      const party = createParty(['Alice']);
      setStatus(party, 0, 'injured');
      const startHealth = party[0].health;
      applyDailyEffects(party, RationsType.Filling, PaceType.Steady, 1);
      expect(party[0].health).toBeLessThan(startHealth);
    });

    it('applies weekly pace/ration effects on day 7', () => {
      const party = createParty(['Alice']);
      const startHealth = party[0].health;
      // Bare rations + grueling pace should reduce health
      applyDailyEffects(party, RationsType.Bare, PaceType.Grueling, 7);
      expect(party[0].health).toBeLessThan(startHealth);
    });

    it('does not apply weekly effects on other days', () => {
      const party = createParty(['Alice']);
      const startHealth = party[0].health;
      applyDailyEffects(party, RationsType.Bare, PaceType.Grueling, 3);
      expect(party[0].health).toBe(startHealth);
    });
  });

  describe('getPartyHealthPercent', () => {
    it('returns 100 for full health party', () => {
      const party = createParty(['Alice', 'Bob']);
      expect(getPartyHealthPercent(party)).toBe(100);
    });

    it('returns correct percentage', () => {
      const party = createParty(['Alice']);
      party[0].health = 50;
      expect(getPartyHealthPercent(party)).toBe(50);
    });

    it('returns 0 for dead party', () => {
      const party = createParty(['Alice']);
      party[0].status = 'dead';
      expect(getPartyHealthPercent(party)).toBe(0);
    });
  });
});
