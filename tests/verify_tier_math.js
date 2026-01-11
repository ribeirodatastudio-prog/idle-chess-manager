import { generateOpponentStats } from '../src/logic/simulation.js';

console.log("Verifying Tier Math...");

const checkRank = (rank) => {
    const data = generateOpponentStats(rank - 1); // wins = rank - 1
    const { tier, currentOpponent, rawStatsSum } = data;
    console.log(`Rank ${rank}: Tier ${tier} • Opponent ${currentOpponent}/10 • Stats ${rawStatsSum}`);
    return data;
};

// Expect Rank 1 -> Tier 1, Opp 1, Stats ~100
const r1 = checkRank(1);
if (r1.tier === 1 && r1.currentOpponent === 1 && Math.abs(r1.rawStatsSum - 100) < 5) {
    console.log("PASS: Rank 1 correct.");
} else {
    console.error("FAIL: Rank 1 stats mismatch.");
}

// Expect Rank 10 -> Tier 1, Opp 10, Stats ~300
const r10 = checkRank(10);
if (r10.tier === 1 && r10.currentOpponent === 10 && Math.abs(r10.rawStatsSum - 300) < 5) {
    console.log("PASS: Rank 10 correct (Tier Ceiling).");
} else {
    console.error("FAIL: Rank 10 stats mismatch.");
}

// Expect Rank 11 -> Tier 2, Opp 1, Stats ~300 (Previous Ceiling = New Floor)
const r11 = checkRank(11);
if (r11.tier === 2 && r11.currentOpponent === 1 && Math.abs(r11.rawStatsSum - 300) < 5) {
    console.log("PASS: Rank 11 correct (Tier 2 Floor).");
} else {
    console.error("FAIL: Rank 11 stats mismatch.");
}

// Expect Rank 20 -> Tier 2, Opp 10.
// Tier 1 Range = 200. Tier 2 Range = 300. Max = 300 + 300 = 600.
const r20 = checkRank(20);
if (r20.tier === 2 && r20.currentOpponent === 10 && Math.abs(r20.rawStatsSum - 600) < 5) {
    console.log("PASS: Rank 20 correct (Tier 2 Ceiling).");
} else {
    console.error("FAIL: Rank 20 stats mismatch.");
}

// Check scaling curve
const r5 = checkRank(5);
// Progress = 4/9 = 0.44. Pow(0.44, 1.5) ~= 0.29.
// Stats = 100 + (200 * 0.29) = 158.
// Linear would be 100 + (200 * 0.44) = 188.
// Should be lower than linear.
if (r5.rawStatsSum < 188) {
    console.log("PASS: Rank 5 shows curve effect (lower than linear).");
} else {
    console.warn("WARNING: Rank 5 scaling might be linear.");
}
