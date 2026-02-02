'use client';

import { GameEvent } from '../game/types';

interface EventDialogProps {
  event: GameEvent;
  onChoice: (choiceId: number) => void;
}

export default function EventDialog({ event, onChoice }: EventDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-amber-900 border-2 border-amber-600 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-amber-200 mb-4">{event.title}</h2>
        
        <p className="text-amber-100 mb-6 leading-relaxed">{event.description}</p>

        <div className="space-y-3">
          {event.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id)}
              className="w-full bg-amber-800 hover:bg-amber-700 text-amber-100 py-3 px-4 rounded-lg
                         text-left transition-colors border border-amber-600 hover:border-amber-500"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
