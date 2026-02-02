'use client';

import { useState } from 'react';

interface NamePartyProps {
  onConfirm: (names: string[]) => void;
}

const DEFAULT_NAMES = ['John', 'Mary', 'William', 'Sarah', 'James'];

export default function NameParty({ onConfirm }: NamePartyProps) {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [month, setMonth] = useState(3); // March

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleSubmit = () => {
    const validNames = names.filter(n => n.trim().length > 0);
    if (validNames.length >= 2) {
      onConfirm(validNames);
    }
  };

  const monthNames = [
    'March', 'April', 'May', 'June', 'July'
  ];

  return (
    <div className="min-h-screen bg-amber-950 flex flex-col items-center justify-center text-amber-100 p-8">
      <div className="bg-amber-900 border border-amber-700 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-3xl font-bold text-amber-200 mb-6 text-center">
          Name Your Party
        </h2>

        <p className="text-amber-400 mb-6 text-center">
          Who will join you on this journey? (2-5 members)
        </p>

        <div className="space-y-3 mb-8">
          {names.map((name, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="text-amber-500 w-24">
                {index === 0 ? 'Leader:' : `Member ${index}:`}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="flex-1 bg-amber-950 border border-amber-700 rounded px-3 py-2
                           text-amber-100 focus:outline-none focus:border-amber-500"
                placeholder={`Person ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="mb-8">
          <label className="block text-amber-400 mb-2">Departure Month:</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full bg-amber-950 border border-amber-700 rounded px-3 py-2
                       text-amber-100 focus:outline-none focus:border-amber-500"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i + 3}>{name}</option>
            ))}
          </select>
          <p className="text-amber-600 text-sm mt-2">
            {month <= 4 ? 'Early departure - more time but colder start' :
             month >= 6 ? 'Late departure - warmer but race against winter' :
             'Good balance of weather and time'}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={names.filter(n => n.trim()).length < 2}
          className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:cursor-not-allowed
                     text-amber-100 py-3 rounded-lg text-lg transition-colors border border-amber-500"
        >
          Continue to Store
        </button>
      </div>
    </div>
  );
}
