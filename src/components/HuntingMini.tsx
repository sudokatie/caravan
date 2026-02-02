'use client';

import { useState } from 'react';

interface HuntingMiniProps {
  ammunition: number;
  onHunt: (ammoUsed: number) => void;
  onCancel: () => void;
}

export default function HuntingMini({ ammunition, onHunt, onCancel }: HuntingMiniProps) {
  const [ammoToUse, setAmmoToUse] = useState(Math.min(10, ammunition));

  const expectedFood = Math.floor(ammoToUse * 5 * 0.6); // rough estimate

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-amber-200 mb-6 text-center">
          Hunting
        </h2>

        <p className="text-amber-400 mb-6 text-center">
          You have {ammunition} rounds of ammunition.
          How much will you use for hunting?
        </p>

        <div className="mb-6">
          <label className="block text-amber-400 mb-2">Ammunition to use:</label>
          <input
            type="range"
            min={1}
            max={Math.min(50, ammunition)}
            value={ammoToUse}
            onChange={(e) => setAmmoToUse(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-amber-300 mt-2">
            <span>{ammoToUse} rounds</span>
            <span>~{expectedFood} lbs food (estimated)</span>
          </div>
        </div>

        <div className="bg-amber-950 border border-amber-700 rounded p-4 mb-6">
          <h3 className="text-amber-300 font-bold mb-2">Hunting Tips:</h3>
          <ul className="text-amber-500 text-sm space-y-1">
            <li>- More ammo = better chance of success</li>
            <li>- Each round can yield up to 5 lbs of food</li>
            <li>- Results vary based on luck</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onHunt(ammoToUse)}
            disabled={ammoToUse <= 0}
            className="flex-1 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700
                       disabled:cursor-not-allowed py-3 rounded-lg font-bold"
          >
            Hunt!
          </button>
        </div>
      </div>
    </div>
  );
}
