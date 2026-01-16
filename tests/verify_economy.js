import { calculatePassiveIncomePerMinute } from '../src/logic/math.js';

console.log("--- Economy Verification ---");

// Test Case 1: Start (0 Wins, 0 Tiers)
const start = calculatePassiveIncomePerMinute(0, 0);
console.log(`Start (0, 0): ${start.toFixed(4)} (Expected: 1.0000)`);

// Test Case 2: 1 Tier Cleared
// Note: In old logic, this would be 1.0. In new logic, 1.01.
const tier1 = calculatePassiveIncomePerMinute(0, 1);
console.log(`Tier 1 (0, 1): ${tier1.toFixed(4)} (Expected: 1.0100)`);

// Test Case 3: 1 Tournament Cleared (1 Win, 10 Tiers)
// Note: Old logic: (1+1)*1.05^1 = 2.1. New logic: (1+1)*1.01^10 = 2.2092
const win1 = calculatePassiveIncomePerMinute(1, 10);
const expectedWin1 = 2 * Math.pow(1.01, 10);
console.log(`Win 1 (1, 10): ${win1.toFixed(4)} (Expected: ${expectedWin1.toFixed(4)})`);

// Test Case 4: 10 Tournaments Cleared (10 Wins, 100 Tiers)
// Note: Old logic: (11)*1.05^10 = 17.91. New logic: (11)*1.01^100 = 29.75
const win10 = calculatePassiveIncomePerMinute(10, 100);
const expectedWin10 = 11 * Math.pow(1.01, 100);
console.log(`Win 10 (10, 100): ${win10.toFixed(4)} (Expected: ${expectedWin10.toFixed(4)})`);
