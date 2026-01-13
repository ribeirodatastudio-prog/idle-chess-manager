import React from 'react';
import { calculateUpgradeCost, calculateStatPower } from '../logic/math';
import { formatNumber } from '../logic/format';

const STAT_LABELS = {
  opening: 'Opening',
  midgame: 'Midgame',
  endgame: 'Endgame',
  tactics: 'Tactics',
  sacrifices: 'Sacrifice Chance'
};

const StatCard = ({ statKey, level, resources, onUpgrade }) => {
  const isSacrifice = statKey === 'sacrifices';
  const isMaxed = isSacrifice && level >= 500;

  // Pass statKey (statName) to calculateUpgradeCost
  const cost = calculateUpgradeCost(level, false, statKey);
  const canAfford = !isMaxed && resources.studyTime >= cost;

  const displayLevel = isSacrifice ? `${(level * 0.2).toFixed(1)}%` : level;

  return (
    <button
      onClick={() => onUpgrade(statKey)}
      disabled={!canAfford || isMaxed}
      className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200 h-24
        ${isMaxed
            ? 'bg-yellow-900/20 border-yellow-700 cursor-default'
            : canAfford
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-blue-500 active:scale-95'
                : 'bg-gray-800/50 border-gray-800 opacity-70 cursor-not-allowed'
        }`}
    >
      <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">{STAT_LABELS[statKey]}</span>
      <span className={`font-mono font-bold text-white mb-1 ${isSacrifice ? 'text-lg' : 'text-xl'}`}>
          {displayLevel}
      </span>

      {isMaxed ? (
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-600 text-white">
              MAX
          </span>
      ) : (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${canAfford ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'}`}>
            {formatNumber(cost)}
          </span>
      )}
    </button>
  );
};

export const StatsHeader = ({ resources, playerElo }) => {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="bg-gray-800 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">Study Time</span>
          <span className="text-blue-300 font-mono text-lg">{formatNumber(resources.studyTime)}</span>
        </div>
        <div className="bg-gray-800 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">Elo</span>
          <span className="text-yellow-400 font-mono text-lg">{playerElo}</span>
        </div>
    </div>
  );
};

export const StatsPanel = ({ stats, resources, onUpgrade }) => {
  return (
    <div className="p-4 pt-0">
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Row 1 */}
        {['opening', 'midgame', 'endgame'].map(key => (
          <StatCard
            key={key}
            statKey={key}
            level={stats[key]}
            resources={resources}
            onUpgrade={onUpgrade}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
         {/* Row 2 */}
         {['tactics', 'sacrifices'].map(key => (
          <StatCard
            key={key} 
            statKey={key} 
            level={stats[key]} 
            resources={resources} 
            onUpgrade={onUpgrade} 
          />
        ))}
      </div>
    </div>
  );
};
