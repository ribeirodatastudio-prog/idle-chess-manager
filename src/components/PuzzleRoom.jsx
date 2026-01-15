
import React, { useState } from 'react';

const PuzzleRoom = ({ state, actions }) => {
  const { puzzleStats, activePuzzle } = state;
  const { solvePuzzle } = actions;

  const [isSolving, setIsSolving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSolve = () => {
    if (isSolving) return;

    setIsSolving(true);
    setFeedback(null);

    // Capture current puzzle for feedback logic
    const currentPuzzle = activePuzzle;

    setTimeout(() => {
        const result = solvePuzzle();
        setIsSolving(false);

        if (result && !result.success) {
             const skill1 = currentPuzzle.skills[0];
             const skill2 = currentPuzzle.skills[1];
             const val1 = state.stats[skill1] || 0;
             const val2 = state.stats[skill2] || 0;

             let weakStat = skill1;
             if (val2 < val1) weakStat = skill2;

             const formatName = (s) => s.charAt(0).toUpperCase() + s.slice(1);
             setFeedback(`Analysis failed... You should study more ${formatName(weakStat)}`);
        }
    }, 4000);
  };

  if (!activePuzzle) {
    return (
      <div className="puzzle-room p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Academy Puzzle</h2>
        <p className="text-gray-400">Searching for a puzzle...</p>
      </div>
    );
  }

  return (
    <div className="puzzle-room p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Academy Puzzle</h2>
        <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400">Puzzle Elo: <span className="text-white font-mono">{puzzleStats.elo}</span></span>
            <span className="text-sm text-gray-400">Prod Mult: <span className="text-green-400 font-mono">x{puzzleStats.multiplier.toFixed(2)}</span></span>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-md mb-4 border border-gray-600 relative">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-lg font-bold text-yellow-400">{activePuzzle.name}</h3>
                <p className="text-gray-300 text-sm italic">"{activePuzzle.flavor}"</p>
            </div>
            <div className="text-right">
                <span className="block text-xs text-gray-400 uppercase tracking-wide">Difficulty</span>
                <span className="text-lg font-bold text-red-400 font-mono">{Math.round(activePuzzle.difficulty)}</span>
            </div>
        </div>

        <div className="mt-3 flex gap-2">
            {activePuzzle.skills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded capitalize border border-gray-500">
                    {skill}
                </span>
            ))}
        </div>

        {/* Overlay for Feedback */}
        {feedback && (
            <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center rounded-md p-4 text-center animate-in fade-in duration-300">
                <p className="text-red-400 font-bold">{feedback}</p>
            </div>
        )}
      </div>

      <button
        onClick={handleSolve}
        disabled={isSolving}
        className={`w-full py-3 font-bold rounded shadow-lg transition-all
            ${isSolving
                ? 'bg-gray-600 text-gray-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
            }`}
      >
        {isSolving ? 'Analyzing Position...' : 'Solve Puzzle'}
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
          Solve to increase Production Multiplier. Difficulty never decreases.
      </p>
    </div>
  );
};

export default PuzzleRoom;
