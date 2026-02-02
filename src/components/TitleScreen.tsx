'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-amber-200 mb-4 tracking-wider">
          CARAVAN
        </h1>
        <p className="text-xl text-amber-400 mb-2">
          The Oregon Trail Awaits
        </p>
        <p className="text-amber-500 mb-12 max-w-md mx-auto">
          Lead your party across 2,000 miles of wilderness.
          Manage supplies. Survive the journey. Reach Oregon City.
        </p>

        <button
          onClick={onStart}
          className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-12 py-4 text-xl rounded-lg
                     transition-colors border-2 border-amber-500 hover:border-amber-400"
        >
          Begin Journey
        </button>

        <div className="mt-16 text-amber-600 text-sm">
          <p>Press ENTER to start</p>
        </div>
      </div>

      <div className="absolute bottom-8 text-amber-700 text-sm">
        A game by Katie
      </div>
    </div>
  );
}
