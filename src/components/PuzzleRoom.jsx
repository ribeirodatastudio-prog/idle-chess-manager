
import React from 'react';

const PuzzleRoom = ({ state, actions }) => {
  const { puzzleStats, activePuzzle } = state;
  const { solvePuzzle } = actions;

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

      <div className="bg-gray-700 p-4 rounded-md mb-4 border border-gray-600">
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
      </div>

      <button
        onClick={solvePuzzle}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-all active:scale-95"
      >
        Solve Puzzle
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
          Solve to increase Production Multiplier. Failure reduces Puzzle Elo.
      </p>
    </div>
  );
};

export default PuzzleRoom;
