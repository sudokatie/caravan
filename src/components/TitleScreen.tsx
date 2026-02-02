'use client';

import { useState } from 'react';
import { DifficultyMode } from '../game/types';

interface TitleScreenProps {
  onStart: (difficulty: DifficultyMode) => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyMode>(DifficultyMode.Normal);

  const difficultyInfo: Record<DifficultyMode, { label: string; desc: string }> = {
    [DifficultyMode.Easy]: { 
      label: 'Easy', 
      desc: '$600 starting money, fewer events, faster healing' 
    },
    [DifficultyMode.Normal]: { 
      label: 'Normal', 
      desc: '$400 starting money, standard events' 
    },
    [DifficultyMode.Hard]: { 
      label: 'Hard', 
      desc: '$300 starting money, more events, harsher conditions' 
    },
  };

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-amber-200 mb-4 tracking-wider">
          CARAVAN
        </h1>
        <p className="text-xl text-amber-400 mb-2">
          The Oregon Trail Awaits
        </p>
        <p className="text-amber-500 mb-8 max-w-md mx-auto">
          Lead your party across 2,000 miles of wilderness.
          Manage supplies. Survive the journey. Reach Oregon City.
        </p>

        <div className="mb-8">
          <p className="text-amber-400 mb-3">Select Difficulty:</p>
          <div className="flex gap-3 justify-center">
            {Object.values(DifficultyMode).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-amber-700 border-amber-400 text-amber-100'
                    : 'bg-amber-900 border-amber-700 text-amber-400 hover:border-amber-500'
                }`}
              >
                {difficultyInfo[diff].label}
              </button>
            ))}
          </div>
          <p className="text-amber-600 text-sm mt-3">
            {difficultyInfo[selectedDifficulty].desc}
          </p>
        </div>

        <button
          onClick={() => onStart(selectedDifficulty)}
          className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-12 py-4 text-xl rounded-lg
                     transition-colors border-2 border-amber-500 hover:border-amber-400"
        >
          Begin Journey
        </button>

        <div className="mt-12 text-amber-600 text-sm">
          <p>Press ENTER to start</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-amber-700 text-sm">
        A game by Katie
      </div>
    </div>
  );
}
