'use client';

import { useState } from 'react';
import { DifficultyMode } from '../game/types';
import { Music } from '../game/Music';
import { Sound } from '../game/Sound';

interface TitleScreenProps {
  onStart: (difficulty: DifficultyMode) => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyMode>(DifficultyMode.Normal);
  const [musicVolume, setMusicVolume] = useState(Music.getVolume());
  const [soundVolume, setSoundVolume] = useState(Sound.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(Music.isEnabled());
  const [soundEnabled, setSoundEnabled] = useState(Sound.isEnabled());

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    Music.setVolume(vol);
  };

  const handleSoundVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setSoundVolume(vol);
    Sound.setVolume(vol);
  };

  const toggleMusic = () => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    Music.setEnabled(newState);
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    Sound.setEnabled(newState);
  };

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

        {/* Audio Settings */}
        <div className="mt-6 p-4 bg-amber-900/50 rounded-lg w-64 mx-auto">
          <h3 className="text-sm font-medium text-amber-400 mb-3 text-center">Audio</h3>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-amber-500">Music</label>
              <button
                onClick={toggleMusic}
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  musicEnabled ? 'bg-amber-600 text-amber-100' : 'bg-amber-800 text-amber-500'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!musicEnabled}
              className="w-full h-1.5 bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-amber-500">Sound</label>
              <button
                onClick={toggleSound}
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  soundEnabled ? 'bg-amber-600 text-amber-100' : 'bg-amber-800 text-amber-500'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={soundVolume}
              onChange={handleSoundVolumeChange}
              disabled={!soundEnabled}
              className="w-full h-1.5 bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-amber-700 text-sm">
        A game by Katie
      </div>
    </div>
  );
}
