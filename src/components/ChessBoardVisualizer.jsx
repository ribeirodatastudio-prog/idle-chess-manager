import React, { useMemo } from 'react';
import ChessPiece from './ChessPiece';

const FEN_CONFIG = {
  opening: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  midgame: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R', // Sicilian Dragon-ish
  endgame: '8/8/4k3/8/8/3P4/4K3/8' // Simple K+P vs K
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

export const ChessBoardVisualizer = ({ phase = 'Opening' }) => {
  const board = useMemo(() => {
    // Normalize phase to key
    const key = phase.toLowerCase();
    const fen = FEN_CONFIG[key] || FEN_CONFIG.opening;
    return parseFEN(fen);
  }, [phase]);

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
