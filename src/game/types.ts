// Game screen states
export enum GameScreen {
  Title = 'title',
  NameParty = 'name_party',
  Store = 'store',
  Traveling = 'traveling',
  Event = 'event',
  River = 'river',
  Hunting = 'hunting',
  Landmark = 'landmark',
  GameOver = 'game_over',
  Victory = 'victory',
}

// Party member health status
export type PartyStatus = 'healthy' | 'sick' | 'injured' | 'dead';

// Party member
export interface PartyMember {
  id: number;
  name: string;
  health: number;
  status: PartyStatus;
  sicknessTurns: number;
}

// Supplies tracking
export interface Supplies {
  food: number;
  ammunition: number;
  medicine: number;
  spareParts: number;
  money: number;
}

// Wagon state
export interface Wagon {
  condition: number;
  oxen: number;
}

// Location types
export type LocationType = 'start' | 'town' | 'landmark' | 'river' | 'destination';

// Map location
export interface Location {
  id: string;
  name: string;
  type: LocationType;
  distanceFromStart: number;
  hasStore: boolean;
  riverDifficulty?: number;
}

// Weather types
export enum WeatherType {
  Clear = 'clear',
  Rain = 'rain',
  Storm = 'storm',
  Snow = 'snow',
  Blizzard = 'blizzard',
}

// Random event types
export enum EventType {
  Illness = 'illness',
  Injury = 'injury',
  Weather = 'weather',
  Breakdown = 'breakdown',
  Theft = 'theft',
  Discovery = 'discovery',
  Animal = 'animal',
}

// Travel pace
export enum PaceType {
  Steady = 'steady',
  Strenuous = 'strenuous',
  Grueling = 'grueling',
}

// Food rations
export enum RationsType {
  Bare = 'bare',
  Meager = 'meager',
  Filling = 'filling',
}

// Event choice
export interface EventChoice {
  id: number;
  text: string;
}

// Random event data
export interface GameEvent {
  id: number;
  type: EventType;
  title: string;
  description: string;
  choices: EventChoice[];
}

// Event result
export interface EventResult {
  message: string;
  healthChange?: Map<number, number>;
  supplyChange?: Partial<Supplies>;
  daysLost?: number;
}

// River crossing result
export interface RiverResult {
  success: boolean;
  message: string;
  suppliesLost?: Partial<Supplies>;
  membersLost?: number[];
  daysLost?: number;
}

// Hunting result
export interface HuntingResult {
  ammoUsed: number;
  foodGained: number;
  message: string;
}

// Full game state
export interface GameData {
  screen: GameScreen;
  day: number;
  month: number;
  year: number;
  distanceTraveled: number;
  currentLocationIndex: number;
  party: PartyMember[];
  supplies: Supplies;
  wagon: Wagon;
  pace: PaceType;
  rations: RationsType;
  weather: WeatherType;
  currentEvent: GameEvent | null;
  messages: string[];
}

// Weather effect modifiers
export interface WeatherEffect {
  travelMod: number;
  healthMod: number;
}

// Turn result
export interface TurnResult {
  distanceTraveled: number;
  reachedLocation: Location | null;
  event: GameEvent | null;
  messages: string[];
}
