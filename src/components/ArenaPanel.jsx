import React, { useEffect, useRef } from 'react';

export const ArenaPanel = ({ 
  tournament, 
  simulationState, 
  onStartTournament 
}) => {
  const { active, wins, currentLevel, opponentStats } = tournament;
  const { evalBar, moveNumber, phase, result } = simulationState;

  // Calculate bar width percentage (0 to 100)
  // Range is -10 to +10. Total range 20.
  // -10 => 0%, 0 => 50%, +10 => 100%
  // Formula: ((eval + 10) / 20) * 100
  const clampedEval = Math.max(-10, Math.min(10, evalBar));
  const barPercentage = ((clampedEval + 10) / 20) * 100;

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-2xl h-full flex flex-col border border-gray-800 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black"></div>

      <h2 className="text-2xl font-bold mb-4 text-center text-gray-100 relative z-10">
        Tournament <span className="text-yellow-500">#{currentLevel}</span>
      </h2>

      {/* Evaluation Bar */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
          <span className="text-red-500 font-bold">BLACK WINS (-10)</span>
          <span>{clampedEval > 0 ? '+' : ''}{clampedEval.toFixed(2)}</span>
          <span className="text-green-500 font-bold">WHITE WINS (+10)</span>
        </div>
        <div className="h-6 bg-gray-700 rounded-full overflow-hidden relative border border-gray-600 shadow-inner">
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
           {/* Alternative visual: A slider thumb */}
           <div 
             className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-in-out z-30 transform -translate-x-1/2"
             style={{ left: `${barPercentage}%` }}
           ></div>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="flex-grow flex flex-col justify-center items-center relative z-10">
        {!active ? (
          <div className="text-center animate-fade-in">
            <p className="text-gray-400 mb-6 max-w-xs mx-auto">
              Prepare your stats. The next opponent awaits.
            </p>
            <button
              onClick={onStartTournament}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 transition-all"
            >
              Start Match
            </button>
            {result && (
              <div className={`mt-4 text-xl font-bold ${result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                Last Match: {result.toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl">
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
                <div className="text-red-400 font-bold text-lg">Rating {opponentStats?.totalPower || '?'}</div>
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
