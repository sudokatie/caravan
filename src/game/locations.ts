import { Location } from './types';

// Route from Independence, Missouri to Oregon City
export const ROUTE: Location[] = [
  {
    id: 'independence',
    name: 'Independence',
    type: 'start',
    distanceFromStart: 0,
    hasStore: true,
  },
  {
    id: 'kansas_river',
    name: 'Kansas River Crossing',
    type: 'river',
    distanceFromStart: 102,
    hasStore: false,
    riverDifficulty: 2,
  },
  {
    id: 'fort_kearny',
    name: 'Fort Kearny',
    type: 'landmark',
    distanceFromStart: 304,
    hasStore: true,
  },
  {
    id: 'chimney_rock',
    name: 'Chimney Rock',
    type: 'landmark',
    distanceFromStart: 554,
    hasStore: false,
  },
  {
    id: 'fort_laramie',
    name: 'Fort Laramie',
    type: 'town',
    distanceFromStart: 640,
    hasStore: true,
  },
  {
    id: 'independence_rock',
    name: 'Independence Rock',
    type: 'landmark',
    distanceFromStart: 830,
    hasStore: false,
  },
  {
    id: 'south_pass',
    name: 'South Pass',
    type: 'landmark',
    distanceFromStart: 932,
    hasStore: false,
  },
  {
    id: 'green_river',
    name: 'Green River Crossing',
    type: 'river',
    distanceFromStart: 988,
    hasStore: false,
    riverDifficulty: 3,
  },
  {
    id: 'fort_bridger',
    name: 'Fort Bridger',
    type: 'town',
    distanceFromStart: 1026,
    hasStore: true,
  },
  {
    id: 'soda_springs',
    name: 'Soda Springs',
    type: 'landmark',
    distanceFromStart: 1160,
    hasStore: false,
  },
  {
    id: 'fort_hall',
    name: 'Fort Hall',
    type: 'town',
    distanceFromStart: 1217,
    hasStore: true,
  },
  {
    id: 'snake_river',
    name: 'Snake River Crossing',
    type: 'river',
    distanceFromStart: 1382,
    hasStore: false,
    riverDifficulty: 4,
  },
  {
    id: 'fort_boise',
    name: 'Fort Boise',
    type: 'landmark',
    distanceFromStart: 1534,
    hasStore: true,
  },
  {
    id: 'blue_mountains',
    name: 'Blue Mountains',
    type: 'landmark',
    distanceFromStart: 1700,
    hasStore: false,
  },
  {
    id: 'the_dalles',
    name: 'The Dalles',
    type: 'town',
    distanceFromStart: 1838,
    hasStore: true,
  },
  {
    id: 'columbia_river',
    name: 'Columbia River',
    type: 'river',
    distanceFromStart: 1900,
    hasStore: false,
    riverDifficulty: 5,
  },
  {
    id: 'oregon_city',
    name: 'Oregon City',
    type: 'destination',
    distanceFromStart: 2000,
    hasStore: true,
  },
];

// Get location by index
export function getLocation(index: number): Location | null {
  if (index < 0 || index >= ROUTE.length) return null;
  return ROUTE[index];
}

// Get next location
export function getNextLocation(currentIndex: number): Location | null {
  return getLocation(currentIndex + 1);
}

// Get distance to next location
export function getDistanceToNext(currentIndex: number, distanceTraveled: number): number {
  const next = getNextLocation(currentIndex);
  if (!next) return 0;
  return next.distanceFromStart - distanceTraveled;
}

// Check if at final destination
export function isDestination(index: number): boolean {
  const location = getLocation(index);
  return location?.type === 'destination';
}

// Get all locations with stores
export function getStoreLocations(): Location[] {
  return ROUTE.filter(loc => loc.hasStore);
}

// Get all river crossings
export function getRiverCrossings(): Location[] {
  return ROUTE.filter(loc => loc.type === 'river');
}
