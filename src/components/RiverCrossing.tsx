'use client';

import { Location } from '../game/types';

interface RiverCrossingProps {
  river: Location;
  money: number;
  spareParts: number;
  onFord: () => void;
  onCaulk: () => void;
  onFerry: () => void;
  onWait: () => void;
}

export default function RiverCrossing({
  river,
  money,
  spareParts,
  onFord,
  onCaulk,
  onFerry,
  onWait,
}: RiverCrossingProps) {
  const ferryCost = (river.riverDifficulty || 1) * 20;
  const difficultyLabel = river.riverDifficulty === 1 ? 'Easy' :
                          river.riverDifficulty === 2 ? 'Moderate' :
                          river.riverDifficulty === 3 ? 'Difficult' :
                          river.riverDifficulty === 4 ? 'Dangerous' : 'Treacherous';

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-amber-200 mb-2 text-center">
          {river.name}
        </h2>
        <p className="text-amber-400 text-center mb-6">
          River Crossing - {difficultyLabel} (Level {river.riverDifficulty})
        </p>

        <p className="text-amber-300 mb-6 text-center">
          The river lies ahead. How will you cross?
        </p>

        <div className="space-y-4">
          <button
            onClick={onFord}
            className="w-full bg-red-800 hover:bg-red-700 py-4 px-4 rounded-lg text-left
                       border border-red-600 transition-colors"
          >
            <div className="font-bold">Ford the River</div>
            <div className="text-sm text-red-300">
              Free, but risky. You may lose supplies or people.
            </div>
          </button>

          <button
            onClick={onCaulk}
            disabled={spareParts < 1}
            className="w-full bg-yellow-800 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed
                       py-4 px-4 rounded-lg text-left border border-yellow-600 transition-colors"
          >
            <div className="font-bold">Caulk and Float</div>
            <div className="text-sm text-yellow-300">
              Uses 1 spare part. Medium risk. {spareParts < 1 && '(No parts!)'}
            </div>
          </button>

          <button
            onClick={onFerry}
            disabled={money < ferryCost}
            className="w-full bg-green-800 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed
                       py-4 px-4 rounded-lg text-left border border-green-600 transition-colors"
          >
            <div className="font-bold">Take the Ferry - ${ferryCost}</div>
            <div className="text-sm text-green-300">
              Safe crossing. {money < ferryCost && '(Not enough money!)'}
            </div>
          </button>

          <button
            onClick={onWait}
            className="w-full bg-blue-800 hover:bg-blue-700 py-4 px-4 rounded-lg text-left
                       border border-blue-600 transition-colors"
          >
            <div className="font-bold">Wait for Better Conditions</div>
            <div className="text-sm text-blue-300">
              Lose 1-3 days. River difficulty may decrease.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
