'use client';

import { Supplies } from '../game/types';
import { STORE_PRICES } from '../game/constants';

interface StoreProps {
  supplies: Supplies;
  onBuy: (item: keyof typeof STORE_PRICES, quantity: number) => void;
  onSell: (item: keyof typeof STORE_PRICES, quantity: number) => void;
  onLeave: () => void;
  locationName: string;
}

const itemLabels: Record<string, { name: string; unit: string }> = {
  food: { name: 'Food', unit: 'lb' },
  ammunition: { name: 'Ammunition', unit: 'box' },
  medicine: { name: 'Medicine', unit: 'dose' },
  spareParts: { name: 'Spare Parts', unit: 'set' },
  oxen: { name: 'Oxen', unit: '' },
};

export default function Store({ supplies, onBuy, onSell, onLeave, locationName }: StoreProps) {
  const items: (keyof typeof STORE_PRICES)[] = ['food', 'ammunition', 'medicine', 'spareParts', 'oxen'];

  const getQuantity = (item: keyof typeof STORE_PRICES): number => {
    if (item === 'ammunition') return supplies.ammunition;
    if (item === 'food') return supplies.food;
    if (item === 'medicine') return supplies.medicine;
    if (item === 'spareParts') return supplies.spareParts;
    return 0; // oxen handled by wagon
  };

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-amber-200 mb-2 text-center">
          General Store
        </h2>
        <p className="text-amber-500 text-center mb-6">{locationName}</p>

        <div className="flex justify-between items-center mb-6 p-4 bg-amber-950 rounded">
          <span className="text-amber-400 text-lg">Your Money:</span>
          <span className="text-green-400 text-2xl font-bold">${supplies.money}</span>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="text-amber-400 border-b border-amber-700">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">You Have</th>
              <th className="text-center py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item} className="border-b border-amber-800">
                <td className="py-3 text-amber-100">{itemLabels[item].name}</td>
                <td className="py-3 text-right text-amber-300">
                  ${STORE_PRICES[item].toFixed(2)}
                  {itemLabels[item].unit && `/${itemLabels[item].unit}`}
                </td>
                <td className="py-3 text-right text-amber-200">
                  {getQuantity(item)} {itemLabels[item].unit}
                </td>
                <td className="py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onSell(item, item === 'food' ? 10 : 1)}
                      disabled={getQuantity(item) <= 0}
                      className="bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed
                                 px-3 py-1 rounded text-sm"
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => onBuy(item, item === 'food' ? 10 : 1)}
                      disabled={supplies.money < STORE_PRICES[item]}
                      className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed
                                 px-3 py-1 rounded text-sm"
                    >
                      Buy
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-amber-600 text-sm mb-6 text-center">
          Tip: Stock up on food and medicine. The trail is unforgiving.
        </p>

        <button
          onClick={onLeave}
          className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100 py-3 rounded-lg
                     text-lg transition-colors border border-amber-500"
        >
          Leave Store
        </button>
      </div>
    </div>
  );
}
