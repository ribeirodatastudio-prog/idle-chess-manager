import React, { useState } from 'react';

export const ArenaPanel = ({ 
  tournament, 
  simulationState, 
  onStartTournament 
}) => {
  const { active, ranks, opponentStats } = tournament;
  const { evalBar, moveNumber, phase, result } = simulationState;

  // Local state for mode selection (only when inactive)
  const [selectedMode, setSelectedMode] = useState('rapid'); // 'rapid', 'blitz', 'classical'

  const currentLevel = ranks[selectedMode];

  // Calculate RankInTier for display (When inactive)
  // If active, use tournament data. If inactive, use calculated preview.
  const displayRank = active ? ranks[tournament.activeMode] : currentLevel;
  const displayTier = Math.ceil(displayRank / 10);
  const displayOpponent = ((displayRank - 1) % 10) + 1;

  const identity = opponentStats?.identity;

  // Calculate bar width percentage (0 to 100)
  // Range is -8 to +8 (New Threshold). Total range 16.
  // -8 => 0%, 0 => 50%, +8 => 100%
  const clampedEval = Math.max(-8, Math.min(8, evalBar));
  const barPercentage = ((clampedEval + 8) / 16) * 100;

  // Helper to handle start
  const handleStart = () => {
      onStartTournament(selectedMode);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-2xl h-full flex flex-col border border-gray-800 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      {/* Header & Mode Selector */}
      <div className="relative z-10 shrink-0 mb-4">
          {!active ? (
              <div className="flex justify-center space-x-2 mb-2">
                  {['rapid', 'blitz', 'classical'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors uppercase tracking-wider ${
                            selectedMode === mode
                                ? 'bg-yellow-500 text-black'
                                : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                        }`}
                      >
                          {mode}
                      </button>
                  ))}
              </div>
          ) : (
             <div className="text-center mb-2">
                 <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-500 uppercase tracking-wider">
                     {tournament.activeMode} Mode
                 </span>
             </div>
          )}

          <div className="text-center">
             <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                Tier <span className="text-yellow-500">{displayTier}</span>
             </h2>
             <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                 Opponent {displayOpponent} / 10
             </p>
          </div>
      </div>

      {/* Identity Display (Active Match Only) */}
      {active && identity && (
          <div className="relative z-10 mb-4 text-center animate-fade-in">
              <h3 className={`text-2xl font-black uppercase tracking-wide ${identity.color} drop-shadow-md`}>
                  {identity.title}
              </h3>
              <p className="text-xs text-gray-400 italic">
                  {identity.hint}
              </p>
          </div>
      )}

      {/* Evaluation Bar */}
      <div className="mb-4 sm:mb-8 relative z-10 shrink-0">
        <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
          <span className="text-red-500 font-bold">BLACK (-8)</span>
          <span>{clampedEval > 0 ? '+' : ''}{clampedEval.toFixed(2)}</span>
          <span className="text-green-500 font-bold">WHITE (+8)</span>
        </div>
        <div className="h-4 sm:h-6 bg-gray-700 rounded-full overflow-hidden relative border border-gray-600 shadow-inner">
          {/* Middle Marker */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500 z-20"></div>
          
          {/* The Bar */}
          <div 
            className="h-full transition-all duration-500 ease-in-out bg-gradient-to-r from-red-600 via-gray-400 to-green-600"
            style={{ 
              width: '100%',
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #ef4444 ${barPercentage}%, 
                #22c55e ${barPercentage}%, 
                #22c55e 100%)`
             }}
          ></div>
           {/* Slider Thumb */}
           <div 
             className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-in-out z-30 transform -translate-x-1/2"
             style={{ left: `${barPercentage}%` }}
           ></div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative z-10">
        {!active ? (
          <div className="text-center animate-fade-in w-full flex flex-col items-center">
            <p className="text-gray-400 mb-4 text-sm sm:text-base max-w-xs mx-auto">
              Prepare your stats. <br/>
              <span className="text-yellow-500 uppercase text-xs font-bold">
                  {selectedMode === 'rapid' && 'Standard Weights'}
                  {selectedMode === 'blitz' && 'Instincts x1.8 | Theory x0.6'}
                  {selectedMode === 'classical' && 'Theory x1.5 | Instincts x0.6'}
              </span>
            </p>

            <button
              onClick={handleStart}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 w-full sm:w-auto rounded-lg sm:rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 transition-all text-lg"
            >
              Start {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Match
            </button>

            {result && (
              <div className={`mt-4 text-lg sm:text-xl font-bold ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                Result: {result.toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
              <div className="text-left">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Player</div>
                <div className="text-green-400 font-bold text-lg">You</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-mono text-white">{moveNumber}/50</div>
                <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">{phase}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Opponent</div>
                <div className="text-red-400 font-bold text-lg">{opponentStats?.totalPower || '?'}</div>
              </div>
            </div>
            
            <div className="h-32 flex items-center justify-center bg-black/30 rounded border border-gray-700/50">
               {/* Simple Simulation Visualizer */}
               <div className="grid grid-cols-8 grid-rows-8 gap-0.5 w-24 h-24 opacity-50">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`${(Math.floor(i / 8) + i) % 2 === 0 ? 'bg-gray-600' : 'bg-gray-800'}`}></div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
