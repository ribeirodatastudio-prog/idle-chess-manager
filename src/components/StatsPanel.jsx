import React from 'react';
import { calculateUpgradeCost, calculateStatPower } from '../logic/math';
import { formatNumber } from '../logic/format';

const STAT_LABELS = {
  opening: 'Opening',
  midgame: 'Midgame',
  endgame: 'Endgame',
  tactics: 'Tactics',
  sacrifices: 'Sacrifices'
};

const StatRow = ({ statKey, level, resources, onUpgrade }) => {
  const cost = calculateUpgradeCost(level);
  const canAfford = resources.studyTime >= cost;
  const power = calculateStatPower(level);

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-2 flex flex-col sm:flex-row justify-between items-center shadow-lg border border-gray-700">
      <div className="flex flex-col mb-2 sm:mb-0 w-full sm:w-auto">
        <span className="text-xl font-bold text-gray-200">{STAT_LABELS[statKey]}</span>
        <span className="text-xs text-gray-400">Level {level} • Power: {power.toFixed(1)}</span>
      </div>
      
      <button 
        onClick={() => onUpgrade(statKey)}
        disabled={!canAfford}
        className={`px-4 py-2 rounded font-semibold w-full sm:w-auto transition-colors duration-200
          ${canAfford 
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
      >
        Train ({formatNumber(cost)})
      </button>
    </div>
  );
};

export const StatsHeader = ({ resources, playerElo }) => {
  return (
    <div className="mb-4 space-y-2">
        <div className="text-gray-300 bg-gray-800 p-3 rounded text-center border border-gray-700">
          <div>Study Time</div>
          <div className="text-blue-300 font-mono text-xl">{formatNumber(resources.studyTime)}</div>
        </div>
        <div className="text-gray-300 bg-gray-800 p-3 rounded text-center border border-gray-700">
          <div>Player Elo</div>
          <div className="text-yellow-400 font-mono text-xl">{playerElo}</div>
        </div>
    </div>
  );
};

export const StatsPanel = ({ stats, resources, onUpgrade }) => {
  return (
    <div className="p-4 pt-0">
      <div className="space-y-2">
        {Object.keys(stats).map(key => (
          <StatRow 
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
