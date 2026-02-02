'use client';

import { PartyMember, PartyStatus as PartyStatusType } from '../game/types';

interface PartyStatusProps {
  party: PartyMember[];
  onUseMedicine?: (memberId: number) => void;
  hasMedicine?: boolean;
}

const statusColors: Record<PartyStatusType, string> = {
  healthy: 'text-green-400',
  sick: 'text-yellow-400',
  injured: 'text-orange-400',
  dead: 'text-red-600',
};

const statusLabels: Record<PartyStatusType, string> = {
  healthy: 'Healthy',
  sick: 'Sick',
  injured: 'Injured',
  dead: 'Dead',
};

export default function PartyStatus({ party, onUseMedicine, hasMedicine }: PartyStatusProps) {
  return (
    <div className="bg-amber-950 border border-amber-800 rounded p-4">
      <h3 className="text-amber-200 font-bold mb-3 text-lg">Party</h3>
      <div className="space-y-2">
        {party.map((member) => (
          <div
            key={member.id}
            className={`flex justify-between items-center p-2 rounded ${
              member.status === 'dead' ? 'bg-gray-900 opacity-50' : 'bg-amber-900/50'
            }`}
          >
            <div className="flex-1">
              <span className="text-amber-100 font-medium">{member.name}</span>
              <span className={`ml-3 text-sm ${statusColors[member.status]}`}>
                {statusLabels[member.status]}
                {member.sicknessTurns > 0 && ` (${member.sicknessTurns}d)`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    member.health > 60 ? 'bg-green-500' :
                    member.health > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${member.health}%` }}
                />
              </div>
              <span className="text-amber-300 text-sm w-8">{member.health}%</span>
              {onUseMedicine && hasMedicine && member.status !== 'dead' && member.status !== 'healthy' && (
                <button
                  onClick={() => onUseMedicine(member.id)}
                  className="text-xs bg-green-700 hover:bg-green-600 px-2 py-1 rounded"
                >
                  Heal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
