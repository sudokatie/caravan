'use client';

import { Supplies, Wagon } from '../game/types';

interface SupplyPanelProps {
  supplies: Supplies;
  wagon: Wagon;
}

export default function SupplyPanel({ supplies, wagon }: SupplyPanelProps) {
  const wagonStatus = wagon.condition > 70 ? 'Good' :
                      wagon.condition > 40 ? 'Fair' :
                      wagon.condition > 0 ? 'Poor' : 'Broken';
  
  const wagonColor = wagon.condition > 70 ? 'text-green-400' :
                     wagon.condition > 40 ? 'text-yellow-400' :
                     wagon.condition > 0 ? 'text-orange-400' : 'text-red-500';

  return (
    <div className="bg-amber-950 border border-amber-800 rounded p-4">
      <h3 className="text-amber-200 font-bold mb-3 text-lg">Supplies</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-400">Food:</span>
          <span className="text-amber-100">{supplies.food} lbs</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">Ammo:</span>
          <span className="text-amber-100">{supplies.ammunition}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">Medicine:</span>
          <span className="text-amber-100">{supplies.medicine}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">Parts:</span>
          <span className="text-amber-100">{supplies.spareParts}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">Money:</span>
          <span className="text-green-400">${supplies.money}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-amber-400">Oxen:</span>
          <span className="text-amber-100">{wagon.oxen}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-amber-800">
        <div className="flex justify-between items-center">
          <span className="text-amber-400">Wagon:</span>
          <span className={wagonColor}>{wagonStatus} ({wagon.condition}%)</span>
        </div>
      </div>
    </div>
  );
}
