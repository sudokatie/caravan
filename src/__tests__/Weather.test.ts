import {
  getSeason,
  getSeasonWeatherChances,
  generateWeather,
  getWeatherEffect,
  preventsTravel,
  getWeatherDescription,
  getWeatherSeverity,
} from '../game/Weather';
import { WeatherType } from '../game/types';
import {
  WEATHER_TRAVEL_MODS,
  WEATHER_HEALTH_MODS,
  SEASON_WEATHER,
} from '../game/constants';

describe('Weather', () => {
  describe('getSeason', () => {
    it('returns spring for March-May', () => {
      expect(getSeason(3)).toBe('spring');
      expect(getSeason(4)).toBe('spring');
      expect(getSeason(5)).toBe('spring');
    });

    it('returns summer for June-August', () => {
      expect(getSeason(6)).toBe('summer');
      expect(getSeason(7)).toBe('summer');
      expect(getSeason(8)).toBe('summer');
    });

    it('returns fall for September-November', () => {
      expect(getSeason(9)).toBe('fall');
      expect(getSeason(10)).toBe('fall');
      expect(getSeason(11)).toBe('fall');
    });

    it('returns winter for December-February', () => {
      expect(getSeason(12)).toBe('winter');
      expect(getSeason(1)).toBe('winter');
      expect(getSeason(2)).toBe('winter');
    });
  });

  describe('getSeasonWeatherChances', () => {
    it('returns spring chances for April', () => {
      const chances = getSeasonWeatherChances(4);
      expect(chances).toEqual(SEASON_WEATHER.spring);
    });

    it('returns summer chances for July', () => {
      const chances = getSeasonWeatherChances(7);
      expect(chances).toEqual(SEASON_WEATHER.summer);
    });

    it('returns fall chances for October', () => {
      const chances = getSeasonWeatherChances(10);
      expect(chances).toEqual(SEASON_WEATHER.fall);
    });

    it('returns winter chances for January', () => {
      const chances = getSeasonWeatherChances(1);
      expect(chances).toEqual(SEASON_WEATHER.winter);
    });

    it('chances sum to 1.0', () => {
      for (const season of ['spring', 'summer', 'fall', 'winter']) {
        const chances = SEASON_WEATHER[season];
        const sum = Object.values(chances).reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1.0);
      }
    });
  });

  describe('generateWeather', () => {
    it('generates valid weather type', () => {
      for (let i = 0; i < 20; i++) {
        const weather = generateWeather(6); // Summer
        expect(Object.values(WeatherType)).toContain(weather);
      }
    });

    it('summer never generates blizzard', () => {
      // Run multiple times to verify
      for (let i = 0; i < 100; i++) {
        const weather = generateWeather(7);
        expect(weather).not.toBe(WeatherType.Blizzard);
      }
    });

    it('winter can generate blizzard', () => {
      // Check that winter has blizzard chance
      const chances = getSeasonWeatherChances(1);
      expect(chances[WeatherType.Blizzard]).toBeGreaterThan(0);
    });
  });

  describe('getWeatherEffect', () => {
    it('returns correct travel modifier for clear', () => {
      const effect = getWeatherEffect(WeatherType.Clear);
      expect(effect.travelMod).toBe(WEATHER_TRAVEL_MODS[WeatherType.Clear]);
    });

    it('returns correct health modifier for storm', () => {
      const effect = getWeatherEffect(WeatherType.Storm);
      expect(effect.healthMod).toBe(WEATHER_HEALTH_MODS[WeatherType.Storm]);
    });

    it('blizzard has severe travel penalty', () => {
      const effect = getWeatherEffect(WeatherType.Blizzard);
      expect(effect.travelMod).toBeLessThan(-100);
    });

    it('snow has health penalty', () => {
      const effect = getWeatherEffect(WeatherType.Snow);
      expect(effect.healthMod).toBeLessThan(0);
    });
  });

  describe('preventsTravel', () => {
    it('returns false for clear weather', () => {
      expect(preventsTravel(WeatherType.Clear)).toBe(false);
    });

    it('returns false for rain', () => {
      expect(preventsTravel(WeatherType.Rain)).toBe(false);
    });

    it('returns false for storm', () => {
      expect(preventsTravel(WeatherType.Storm)).toBe(false);
    });

    it('returns false for snow', () => {
      expect(preventsTravel(WeatherType.Snow)).toBe(false);
    });

    it('returns true for blizzard', () => {
      expect(preventsTravel(WeatherType.Blizzard)).toBe(true);
    });
  });

  describe('getWeatherDescription', () => {
    it('returns description for each weather type', () => {
      expect(getWeatherDescription(WeatherType.Clear)).toBe('Clear skies');
      expect(getWeatherDescription(WeatherType.Rain)).toBe('Light rain');
      expect(getWeatherDescription(WeatherType.Storm)).toBe('Heavy storm');
      expect(getWeatherDescription(WeatherType.Snow)).toBe('Snow');
      expect(getWeatherDescription(WeatherType.Blizzard)).toContain('Blizzard');
    });
  });

  describe('getWeatherSeverity', () => {
    it('clear has lowest severity', () => {
      expect(getWeatherSeverity(WeatherType.Clear)).toBe(0);
    });

    it('blizzard has highest severity', () => {
      expect(getWeatherSeverity(WeatherType.Blizzard)).toBe(4);
    });

    it('severity increases with worse weather', () => {
      expect(getWeatherSeverity(WeatherType.Rain)).toBeGreaterThan(
        getWeatherSeverity(WeatherType.Clear)
      );
      expect(getWeatherSeverity(WeatherType.Storm)).toBeGreaterThan(
        getWeatherSeverity(WeatherType.Rain)
      );
      expect(getWeatherSeverity(WeatherType.Snow)).toBeGreaterThan(
        getWeatherSeverity(WeatherType.Storm)
      );
      expect(getWeatherSeverity(WeatherType.Blizzard)).toBeGreaterThan(
        getWeatherSeverity(WeatherType.Snow)
      );
    });
  });
});
