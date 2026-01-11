import React, { useEffect, useRef } from 'react';

export const LogsPanel = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-2xl h-full flex flex-col border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">Match Log</h2>
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto space-y-2 font-mono text-sm pr-2 custom-scrollbar"
      >
        {logs.length === 0 && (
          <div className="text-gray-600 italic text-center mt-10">No match data yet...</div>
        )}
        {logs.map((log, index) => (
          <div key={index} className="bg-gray-800/50 p-2 rounded border-l-2 border-blue-500 animate-slide-in">
            <span className="text-gray-500 text-xs block mb-1">Move {log.move}</span>
            <span className={log.message.includes('Swing') ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
