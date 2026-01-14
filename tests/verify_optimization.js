
/* eslint-env node */
import { generateOpponentStats } from '../src/logic/simulation.js';

console.log("=== VERIFY OPTIMIZATION CORRECTNESS ===");

const verify = (rankData) => {
    const result = generateOpponentStats(rankData);
    const stats = result.stats;
    const values = Object.values(stats);

    // 1. Check Sum
    const sum = values.reduce((a, b) => a + b, 0);
    const expected = result.rawStatsSum;

    if (sum !== expected) {
        console.error(`❌ SUM MISMATCH! Expected ${expected}, Got ${sum}`);
        throw new Error("Sum mismatch");
    } else {
        console.log(`✅ Sum Matches: ${sum}`);
    }

    // 2. Check Variance (Unless sum is very small)
    if (sum > 100) {
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (min === max) {
             const nonCapped = Object.keys(stats).filter(k => k !== 'sacrifices').map(k => stats[k]);
             const minNC = Math.min(...nonCapped);
             const maxNC = Math.max(...nonCapped);

             if (minNC === maxNC) {
                 console.error(`❌ NO VARIANCE! All non-sacrifice stats are ${minNC}`);
                 throw new Error("No variance");
             } else {
                 console.log(`✅ Variance Verified (Spread: ${maxNC - minNC})`);
             }
        } else {
            console.log(`✅ Variance Verified (Global Spread: ${max - min})`);
        }
    }
};

console.log("Testing Mid Game...");
verify({ tournamentIndex: 9, tierIndex: 5, matchIndex: 1 });

console.log("Testing End Game...");
verify({ tournamentIndex: 19, tierIndex: 9, matchIndex: 2 });

console.log("All verifications passed.");
