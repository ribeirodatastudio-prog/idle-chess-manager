import React, { useMemo } from 'react';

export const MatchResultModal = ({ result, matchHistory, onContinue }) => {
  const stats = useMemo(() => {
    if (!matchHistory || matchHistory.length === 0) return null;

    let highestEval = -Infinity;
    let blunders = 0;

    matchHistory.forEach(frame => {
       // Highest Eval
       if (frame.newEval > highestEval) {
           highestEval = frame.newEval;
       }

       // Blunder Detection (Negative Swing >= 50% of MaxClamp)
       // Assuming MaxClamp is available in frame. If not, use a default or heuristic.
       if (frame.MaxClamp && frame.delta <= -(frame.MaxClamp * 0.5)) {
           blunders++;
       }
    });

    // If highestEval is still -Infinity (e.g. empty history), default to 0
    if (highestEval === -Infinity) highestEval = 0;

    return { highestEval, blunders, totalMoves: matchHistory.length };
  }, [matchHistory]);

  if (!stats) return null;

  const isVictory = result === 'win';

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">

        {/* Decorative Glow */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${isVictory ? 'bg-yellow-500 shadow-[0_0_20px_#EAB308]' : 'bg-gray-500 shadow-[0_0_20px_#6B7280]'}`}></div>

        <h2 className={`text-4xl font-black uppercase tracking-wider mb-2 ${isVictory ? 'text-yellow-400 drop-shadow-md' : 'text-gray-400'}`}>
            {isVictory ? 'VICTORY' : result === 'draw' ? 'DRAW' : 'DEFEAT'}
        </h2>

        <p className="text-gray-500 text-sm italic mb-6">
            {isVictory ? 'Outstanding Performance!' : 'Back to the study room...'}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Highest Eval</div>
                <div className="text-xl font-mono font-bold text-green-400">
                    {stats.highestEval > 0 ? '+' : ''}{stats.highestEval.toFixed(2)}
                </div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Blunders</div>
                <div className={`text-xl font-mono font-bold ${stats.blunders > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                    {stats.blunders}
                </div>
            </div>
        </div>

        <button
            onClick={onContinue}
            className={`w-full py-3 rounded-lg font-bold text-lg uppercase tracking-wide transition-all transform hover:scale-105 ${
                isVictory
                ? 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'bg-gray-700 hover:bg-gray-600 text-white shadow-lg'
            }`}
        >
            Continue
        </button>

      </div>
    </div>
  );
};
