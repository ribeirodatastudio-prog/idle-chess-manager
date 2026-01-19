import React, { useState, useEffect } from 'react';

export const FloatingFeedback = ({ delta, maxClamp, moveNumber }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (moveNumber === 0) {
        setItems([]);
        return;
    }

    const absDelta = Math.abs(delta);
    const isPositive = delta > 0;
    const isBrilliant = maxClamp && absDelta >= (maxClamp * 0.5);

    // Determine Symbol and Color
    let symbol = '';
    let colorClass = '';

    if (isBrilliant) {
        symbol = isPositive ? '!!' : '??';
        colorClass = isPositive ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]';
    } else {
        symbol = isPositive ? '!' : '?';
        colorClass = isPositive ? 'text-green-400' : 'text-orange-400';
    }

    // Add new item
    const newItem = {
      id: Date.now() + Math.random(),
      symbol,
      colorClass,
      left: 50 + (Math.random() * 20 - 10), // Randomize X position slightly (40-60%)
    };

    setItems(prev => [...prev, newItem]);

    // Remove item after animation
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== newItem.id));
    }, 1500);

  }, [moveNumber]); // Only trigger on moveNumber change

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {items.map(item => (
        <div
          key={item.id}
          className={`absolute top-1/2 text-4xl font-black ${item.colorClass} animate-float-up`}
          style={{ left: `${item.left}%` }}
        >
          {item.symbol}
        </div>
      ))}
    </div>
  );
};
