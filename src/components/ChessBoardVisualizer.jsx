import React, { useMemo, useState, useEffect, useRef } from 'react';
import ChessPiece from './ChessPiece';
import { CHESS_POSITIONS } from '../data/chessPositions';

const FEN_CONFIG = {
  opening: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  midgame: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R',
  endgame: '8/8/4k3/8/8/3P4/4K3/8'
};

const parseFEN = (fen) => {
  const rows = fen.split(' ')[0].split('/');
  const board = [];

  for (let rowStr of rows) {
    const row = [];
    for (let char of rowStr) {
      if (!isNaN(char)) {
        // Empty squares
        for (let i = 0; i < parseInt(char); i++) {
          row.push(null);
        }
      } else {
        row.push(char);
      }
    }
    board.push(row);
  }
  return board;
};

// Simple pseudo-random function
const pseudoRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const selectFen = (phase, evaluation, seed) => {
    const phaseKey = Object.keys(CHESS_POSITIONS).find(k => k.toLowerCase() === phase.toLowerCase()) || 'Opening';

    let evalKey = 'Even';
    if (evaluation > 1.5) evalKey = 'Winning';
    if (evaluation < -1.5) evalKey = 'Losing';

    const categoryList = CHESS_POSITIONS[phaseKey]?.[evalKey] || CHESS_POSITIONS['Opening']['Even'];

    // Ensure we have a list
    if (!categoryList || categoryList.length === 0) {
         return FEN_CONFIG.opening;
    }

    // Mix seed with string lengths to vary it per category
    const finalSeed = seed + phaseKey.length + evalKey.length;
    const index = Math.floor(pseudoRandom(finalSeed) * categoryList.length);

    return categoryList[index];
};

export const ChessBoardVisualizer = ({ phase = 'Opening', moveNumber = 0, evaluation = 0 }) => {

  const blockIndex = Math.floor(moveNumber / 10);

  // State to hold the current FEN
  const [currentFen, setCurrentFen] = useState(() => selectFen(phase, evaluation, blockIndex));

  // Refs to track changes
  const lastBlockIndex = useRef(blockIndex);
  const lastPhase = useRef(phase);

  // Effect to update FEN on triggers (10 moves or phase change)
  useEffect(() => {
    const blockChanged = blockIndex !== lastBlockIndex.current;
    const phaseChanged = phase !== lastPhase.current;

    if (blockChanged || phaseChanged) {
        const newFen = selectFen(phase, evaluation, blockIndex);
        setCurrentFen(newFen);

        lastBlockIndex.current = blockIndex;
        lastPhase.current = phase;
    }
  }, [blockIndex, phase, evaluation]);

  const board = useMemo(() => {
    return parseFEN(currentFen);
  }, [currentFen]);

  return (
    <div className="w-full max-w-[320px] aspect-square mx-auto border-4 border-gray-800 rounded-sm shadow-2xl bg-gray-900 relative">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const isDark = (rowIndex + colIndex) % 2 === 1;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`relative flex items-center justify-center ${
                  isDark ? 'bg-gray-700/50' : 'bg-gray-600/20'
                }`}
              >
                {piece && (
                  <div className="w-[85%] h-[85%] pointer-events-none drop-shadow-md">
                    <ChessPiece piece={piece} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Overlay to blend it a bit if needed, or scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/assets/noise.png')] opacity-10 mix-blend-overlay"></div>
    </div>
  );
};
