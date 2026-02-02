'use client';

import { Location, Supplies, Wagon } from '../game/types';
import SupplyPanel from './SupplyPanel';

interface LandmarkViewProps {
  location: Location;
  supplies: Supplies;
  wagon: Wagon;
  onContinue: () => void;
  onRest: () => void;
  onStore: () => void;
}

export default function LandmarkView({
  location,
  supplies,
  wagon,
  onContinue,
  onRest,
  onStore,
}: LandmarkViewProps) {
  const isDestination = location.type === 'destination';

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-amber-200 mb-2 text-center">
          {location.name}
        </h2>
        <p className="text-amber-400 text-center mb-6 capitalize">
          {location.type === 'town' ? 'Trading Post' : 
           location.type === 'landmark' ? 'Landmark' :
           location.type === 'destination' ? 'Your Destination' : 'Rest Stop'}
        </p>

        {isDestination ? (
          <div className="text-center mb-6">
            <p className="text-2xl text-green-400 mb-4">
              You have reached your destination!
            </p>
            <p className="text-amber-300">
              After months on the trail, you have finally arrived.
            </p>
          </div>
        ) : (
          <p className="text-amber-300 mb-6 text-center">
            You have arrived at {location.name}. 
            {location.hasStore && ' There is a store here where you can resupply.'}
            {' '}Take some time to rest and prepare for the journey ahead.
          </p>
        )}

        <div className="mb-6">
          <SupplyPanel supplies={supplies} wagon={wagon} />
        </div>

        {!isDestination && (
          <div className="grid grid-cols-3 gap-4">
            {location.hasStore && (
              <button
                onClick={onStore}
                className="bg-green-700 hover:bg-green-600 py-3 rounded-lg font-bold"
              >
                Visit Store
              </button>
            )}
            <button
              onClick={onRest}
              className={`bg-blue-700 hover:bg-blue-600 py-3 rounded-lg ${
                !location.hasStore ? 'col-span-2' : ''
              }`}
            >
              Rest (1 day)
            </button>
            <button
              onClick={onContinue}
              className="bg-amber-700 hover:bg-amber-600 py-3 rounded-lg font-bold"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
