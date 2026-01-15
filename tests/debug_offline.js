import { calculatePassiveIncomePerSecond, calculateOfflineGain } from '../src/logic/math.js';

// Mock localStorage data
const mockSave = {
  lastSaveTime: Date.now() - 3600000, // 1 hour ago
  tournament: {
    ranks: {
      rapid: { tournamentIndex: 1, tierIndex: 0, matchIndex: 0 }, // Index 1
      blitz: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
      classical: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
      bullet: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 },
      chess960: { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 }
    }
  },
  puzzleStats: { multiplier: 1.0 }
};

// Calculate Rate
const getIdx = (r) => (typeof r === 'object' ? r.tournamentIndex : 0);
let cumulativeIdx = 0;
const modes = ['rapid', 'blitz', 'classical', 'bullet', 'chess960'];
modes.forEach(m => {
    if (mockSave.tournament.ranks[m]) cumulativeIdx += getIdx(mockSave.tournament.ranks[m]);
});

const rate = calculatePassiveIncomePerSecond(cumulativeIdx) * mockSave.puzzleStats.multiplier;
console.log("Calculated Rate:", rate);

// Calculate Gain
const result = calculateOfflineGain(mockSave.lastSaveTime, rate);
console.log("Offline Result:", result);

// Test Minimum Threshold
const shortTime = Date.now() - 30000; // 30s ago
const shortResult = calculateOfflineGain(shortTime, rate);
console.log("Short Result (<60s):", shortResult);
