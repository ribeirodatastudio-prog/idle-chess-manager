import React from 'react';
import { formatNumber, formatTimeShort } from '../logic/format';

export const OfflineModal = ({ isOpen, isLoading, data, onClaim }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">

        {/* Step 1: Calculating */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-6 py-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-bold text-gray-200 animate-pulse">Doing Puzzles...</h2>
          </div>
        )}

        {/* Step 2: Ready */}
        {!isLoading && data && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-slide-up">
            <div className="text-center">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                    WELCOME BACK, GRANDMASTER!
                </h2>
                <p className="text-gray-400 text-sm">
                    While you were away, your preparation continued.
                </p>
            </div>

            <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Time Away</span>
                    <span className="text-white font-mono text-lg">{formatTimeShort(data?.seconds || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                    <span className="text-blue-400 text-sm font-bold uppercase tracking-wider">Study Time</span>
                    <span className="text-green-400 font-mono text-2xl font-bold">+{formatNumber(data?.gain || 0)}</span>
                </div>
            </div>

            <button
                onClick={onClaim}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-xl rounded-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                CLAIM REWARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
