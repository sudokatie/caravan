import { WeatherType, WeatherEffect } from './types';
import {
  WEATHER_TRAVEL_MODS,
  WEATHER_HEALTH_MODS,
  SEASON_WEATHER,
} from './constants';

/**
 * Get the season name from a month number (1-12)
 */
export function getSeason(month: number): string {
  // Normalize to 1-12
  const m = ((month - 1) % 12) + 1;
  
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

/**
 * Get weather chances for a given month
 */
export function getSeasonWeatherChances(month: number): Record<WeatherType, number> {
  const season = getSeason(month);
  return SEASON_WEATHER[season] as Record<WeatherType, number>;
}

/**
 * Generate random weather based on month/season
 */
export function generateWeather(month: number): WeatherType {
  const chances = getSeasonWeatherChances(month);
  const roll = Math.random();
  
  let cumulative = 0;
  for (const [weather, chance] of Object.entries(chances)) {
    cumulative += chance;
    if (roll < cumulative) {
      return weather as WeatherType;
    }
  }
  
  // Fallback to clear
  return WeatherType.Clear;
}

/**
 * Get weather effects (travel and health modifiers)
 */
export function getWeatherEffect(weather: WeatherType): WeatherEffect {
  return {
    travelMod: WEATHER_TRAVEL_MODS[weather],
    healthMod: WEATHER_HEALTH_MODS[weather],
  };
}

/**
 * Check if weather prevents travel
 */
export function preventsTravel(weather: WeatherType): boolean {
  return WEATHER_TRAVEL_MODS[weather] <= -999;
}

/**
 * Get weather description for display
 */
export function getWeatherDescription(weather: WeatherType): string {
  switch (weather) {
    case WeatherType.Clear:
      return 'Clear skies';
    case WeatherType.Rain:
      return 'Light rain';
    case WeatherType.Storm:
      return 'Heavy storm';
    case WeatherType.Snow:
      return 'Snow';
    case WeatherType.Blizzard:
      return 'Blizzard - cannot travel';
  }
}

/**
 * Get weather severity (0-4, higher = worse)
 */
export function getWeatherSeverity(weather: WeatherType): number {
  switch (weather) {
    case WeatherType.Clear:
      return 0;
    case WeatherType.Rain:
      return 1;
    case WeatherType.Storm:
      return 2;
    case WeatherType.Snow:
      return 3;
    case WeatherType.Blizzard:
      return 4;
  }
}
