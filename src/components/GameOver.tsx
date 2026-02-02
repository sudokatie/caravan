'use client';

import { GameData } from '../game/types';

interface GameOverProps {
  game: GameData;
  isVictory: boolean;
  onRestart: () => void;
}

export default function GameOver({ game, isVictory, onRestart }: GameOverProps) {
  const survivors = game.party.filter(m => m.status !== 'dead');
  const deaths = game.party.filter(m => m.status === 'dead');

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-lg w-full text-center">
        {isVictory ? (
          <>
            <h2 className="text-4xl font-bold text-green-400 mb-4">
              VICTORY!
            </h2>
            <p className="text-2xl text-amber-200 mb-6">
              You have reached Oregon City!
            </p>
            <p className="text-amber-300 mb-4">
              After {game.day} days on the trail, your party has arrived safely.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-red-500 mb-4">
              GAME OVER
            </h2>
            <p className="text-xl text-amber-200 mb-6">
              Your party has perished on the trail.
            </p>
            <p className="text-amber-400 mb-4">
              {game.distanceTraveled} miles traveled in {game.day} days.
            </p>
          </>
        )}

        <div className="bg-amber-950 border border-amber-700 rounded p-4 mb-6">
          <h3 className="text-amber-200 font-bold mb-3">Party Status</h3>
          {survivors.length > 0 && (
            <div className="mb-3">
              <p className="text-green-400 font-bold">Survivors ({survivors.length}):</p>
              <p className="text-amber-300">
                {survivors.map(m => m.name).join(', ')}
              </p>
            </div>
          )}
          {deaths.length > 0 && (
            <div>
              <p className="text-red-400 font-bold">Lost ({deaths.length}):</p>
              <p className="text-amber-500">
                {deaths.map(m => m.name).join(', ')}
              </p>
            </div>
          )}
        </div>

        <div className="bg-amber-950 border border-amber-700 rounded p-4 mb-6">
          <h3 className="text-amber-200 font-bold mb-2">Journey Statistics</h3>
          <div className="text-amber-400 text-sm space-y-1">
            <p>Distance: {game.distanceTraveled} / 2000 miles</p>
            <p>Days on Trail: {game.day}</p>
            <p>Remaining Supplies: {game.supplies.food} lbs food, ${game.supplies.money}</p>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-amber-700 hover:bg-amber-600 py-4 rounded-lg text-xl font-bold
                     transition-colors border border-amber-500"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
