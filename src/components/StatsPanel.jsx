import React from 'react';
import { calculateUpgradeCost } from '../logic/math';
import { formatNumber } from '../logic/format';
import { Sword, Shield, Skull, BookOpen, Disc, Flag } from 'lucide-react';

const STAT_CONFIG = {
  opening: { label: 'Opening', icon: BookOpen },
  midgame: { label: 'Midgame', icon: Disc },
  endgame: { label: 'Endgame', icon: Flag },
  tactics: { label: 'Tactics', icon: Sword },
  sacrifices: { label: 'Sacrifice', icon: Skull },
  defense: { label: 'Defense', icon: Shield }
};

const StatCard = ({ statKey, level, resources, onUpgrade }) => {
  const isSacrifice = statKey === 'sacrifices';
  const isMaxed = isSacrifice && level >= 500;

  const cost = calculateUpgradeCost(level, false, statKey);
  const canAfford = !isMaxed && resources.studyTime >= cost;

  const displayLevel = isSacrifice ? `${(level * 0.2).toFixed(1)}%` : level;

  const { icon: Icon, label } = STAT_CONFIG[statKey];

  // Specific check for the 3 stats that need to replace label with icon
  // The user said "Replace text labels 'Tactics', 'Defense', 'Sacrifice' with icons"
  // But purely replacing text with icon might be confusing without tooltip or context?
  // I will show Icon prominently.
  // For phases, I'll show Label.
  const showIcon = ['tactics', 'sacrifices', 'defense'].includes(statKey);

  return (
    <button
      onClick={() => onUpgrade(statKey)}
      disabled={!canAfford || isMaxed}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 h-28 w-full group
        glass-card
        ${isMaxed
            ? 'border-yellow-500/30 bg-yellow-900/10 cursor-default'
            : canAfford
                ? 'hover:bg-gunmetal-light hover:scale-[1.02] hover:shadow-xl hover:border-gold-primary/50'
                : 'opacity-50 cursor-not-allowed grayscale-[0.5]'
        }`}
    >
      {/* Icon or Label */}
      <div className="mb-2 text-gray-400 group-hover:text-gold-primary transition-colors">
          {showIcon ? (
              <Icon size={24} strokeWidth={1.5} />
          ) : (
              <span className="text-xs uppercase font-bold tracking-widest">{label}</span>
          )}
      </div>

      {/* Level */}
      <span className={`font-mono font-bold text-white mb-2 ${isSacrifice ? 'text-lg' : 'text-2xl'}`}>
          {displayLevel}
      </span>

      {/* Cost */}
      {isMaxed ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-500 border border-yellow-500/30">
              MAX
          </span>
      ) : (
          <span className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
              canAfford
                ? 'text-blue-300 bg-blue-900/20 border border-blue-500/30 group-hover:bg-blue-900/40'
                : 'text-gray-500 bg-gray-800/50'
          }`}>
            {formatNumber(cost)}
          </span>
      )}
    </button>
  );
};

export const StatsHeader = ({ resources, playerElo, tournamentIndex = 0, tiersCleared = 0, puzzleMultiplier = 1.0, tenureMultiplier = 1.0, instinctMultiplier = 1.0, totalIncome }) => {
  const rawBase = 1 + tournamentIndex;
  const tierMultiplier = Math.pow(1.01, tiersCleared);

  // Use passed totalIncome or calculate fallback
  const displayIncome = totalIncome !== undefined ? totalIncome : (rawBase * tierMultiplier * puzzleMultiplier * tenureMultiplier * instinctMultiplier);

  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center relative group">
          <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Study Time</span>
          <span className="text-blue-400 font-mono text-xl font-bold leading-none mb-1 text-shadow-glow">
            {formatNumber(resources.studyTime)}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/20">
              +{formatNumber(displayIncome)}/min
          </span>

          {/* Tooltip */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg p-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
             <div className="text-[10px] text-gray-400 font-mono space-y-1">
                 <div className="flex justify-between">
                     <span>Base:</span>
                     <span className="text-white">{formatNumber(rawBase)}/min</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Tiers:</span>
                     <span className="text-purple-400">x{tierMultiplier.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Puzzles:</span>
                     <span className="text-yellow-400">x{puzzleMultiplier.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Tenure:</span>
                     <span className="text-blue-400">x{tenureMultiplier.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                     <span>Instinct:</span>
                     <span className="text-red-400">x{instinctMultiplier.toFixed(2)}</span>
                 </div>
                 <div className="h-px bg-gray-700 my-1"></div>
                 <div className="flex justify-between font-bold">
                     <span>TOTAL:</span>
                     <span className="text-emerald-400">{formatNumber(displayIncome)}/min</span>
                 </div>
             </div>
          </div>
        </div>
        <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center">
          <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Elo</span>
          <span className="text-gold-primary font-mono text-xl font-bold">{playerElo}</span>
        </div>
    </div>
  );
};

export const StatsPanel = ({ stats, resources, onUpgrade }) => {
  return (
    <div className="p-4 pt-0">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {/* Row 1: Phases */}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
         {/* Row 2: Skills */}
         {['tactics', 'sacrifices', 'defense'].map(key => (
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
