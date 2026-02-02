'use client';

import { GameData, PaceType, RationsType } from '../game/types';
import { ROUTE } from '../game/locations';
import StatusBar from './StatusBar';
import PartyStatus from './PartyStatus';
import SupplyPanel from './SupplyPanel';

interface TravelViewProps {
  game: GameData;
  onContinue: () => void;
  onRest: () => void;
  onHunt: () => void;
  onChangePace: (pace: PaceType) => void;
  onChangeRations: (rations: RationsType) => void;
  onUseMedicine: (memberId: number) => void;
  onRepairWagon: () => void;
}

export default function TravelView({
  game,
  onContinue,
  onRest,
  onHunt,
  onChangePace,
  onChangeRations,
  onUseMedicine,
  onRepairWagon,
}: TravelViewProps) {
  const currentLocation = ROUTE[game.currentLocationIndex];
  const nextLocation = ROUTE[game.currentLocationIndex + 1];
  const distanceToNext = nextLocation 
    ? nextLocation.distanceFromStart - game.distanceTraveled
    : 2000 - game.distanceTraveled;

  return (
    <div className="min-h-screen bg-amber-950 text-amber-100">
      <StatusBar game={game} />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Location info */}
          <div className="bg-amber-900 border border-amber-700 rounded-lg p-4 mb-6">
            <h2 className="text-2xl font-bold text-amber-200">
              {game.distanceTraveled === 0 ? 'Starting from' : 'Last stop:'} {currentLocation?.name}
            </h2>
            {nextLocation && (
              <p className="text-amber-400 mt-1">
                Next: {nextLocation.name} ({distanceToNext} miles)
              </p>
            )}
          </div>

          {/* Messages */}
          {game.messages.length > 0 && (
            <div className="bg-amber-800/50 border border-amber-600 rounded-lg p-4 mb-6">
              {game.messages.map((msg, i) => (
                <p key={i} className="text-amber-200">{msg}</p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Party */}
            <PartyStatus 
              party={game.party} 
              onUseMedicine={onUseMedicine}
              hasMedicine={game.supplies.medicine > 0}
            />

            {/* Center: Actions */}
            <div className="space-y-4">
              <div className="bg-amber-950 border border-amber-800 rounded p-4">
                <h3 className="text-amber-200 font-bold mb-3">Travel Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-amber-400 text-sm">Pace:</label>
                    <select
                      value={game.pace}
                      onChange={(e) => onChangePace(e.target.value as PaceType)}
                      className="w-full mt-1 bg-amber-900 border border-amber-700 rounded px-3 py-2"
                    >
                      <option value={PaceType.Steady}>Steady (15 mi/day)</option>
                      <option value={PaceType.Strenuous}>Strenuous (20 mi/day)</option>
                      <option value={PaceType.Grueling}>Grueling (25 mi/day)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-amber-400 text-sm">Rations:</label>
                    <select
                      value={game.rations}
                      onChange={(e) => onChangeRations(e.target.value as RationsType)}
                      className="w-full mt-1 bg-amber-900 border border-amber-700 rounded px-3 py-2"
                    >
                      <option value={RationsType.Filling}>Filling (3 lbs/person)</option>
                      <option value={RationsType.Meager}>Meager (2 lbs/person)</option>
                      <option value={RationsType.Bare}>Bare (1 lb/person)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onContinue}
                  className="bg-green-700 hover:bg-green-600 py-3 rounded-lg text-lg font-bold"
                >
                  Continue
                </button>
                <button
                  onClick={onRest}
                  className="bg-blue-700 hover:bg-blue-600 py-3 rounded-lg text-lg"
                >
                  Rest
                </button>
                <button
                  onClick={onHunt}
                  disabled={game.supplies.ammunition <= 0}
                  className="bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed 
                             py-3 rounded-lg"
                >
                  Hunt
                </button>
                <button
                  onClick={onRepairWagon}
                  disabled={game.supplies.spareParts <= 0 || game.wagon.condition >= 100}
                  className="bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed
                             py-3 rounded-lg"
                >
                  Repair
                </button>
              </div>
            </div>

            {/* Right: Supplies */}
            <SupplyPanel supplies={game.supplies} wagon={game.wagon} />
          </div>
        </div>
      </div>
    </div>
  );
}
