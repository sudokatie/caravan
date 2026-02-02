'use client';

import { GameData, WeatherType, PaceType, RationsType } from '../game/types';

interface StatusBarProps {
  game: GameData;
}

const weatherLabels: Record<WeatherType, string> = {
  [WeatherType.Clear]: 'Clear',
  [WeatherType.Rain]: 'Rain',
  [WeatherType.Storm]: 'Storm',
  [WeatherType.Snow]: 'Snow',
  [WeatherType.Blizzard]: 'Blizzard',
};

const paceLabels: Record<PaceType, string> = {
  [PaceType.Steady]: 'Steady',
  [PaceType.Strenuous]: 'Strenuous',
  [PaceType.Grueling]: 'Grueling',
};

const rationsLabels: Record<RationsType, string> = {
  [RationsType.Bare]: 'Bare',
  [RationsType.Meager]: 'Meager',
  [RationsType.Filling]: 'Filling',
};

export default function StatusBar({ game }: StatusBarProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dateStr = `${monthNames[game.month - 1]} ${game.day}, ${game.year}`;
  const milesRemaining = 2000 - game.distanceTraveled;

  return (
    <div className="bg-amber-900 text-amber-100 p-3 flex justify-between items-center text-sm font-mono">
      <div className="flex gap-6">
        <span>{dateStr}</span>
        <span>Day {game.day}</span>
      </div>
      <div className="flex gap-6">
        <span>Miles: {game.distanceTraveled} / 2000</span>
        <span>Weather: {weatherLabels[game.weather]}</span>
        <span>Pace: {paceLabels[game.pace]}</span>
        <span>Rations: {rationsLabels[game.rations]}</span>
      </div>
      <div>
        <span className="text-amber-300">{milesRemaining} miles to go</span>
      </div>
    </div>
  );
}
