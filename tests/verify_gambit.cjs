const { calculateMove } = require('../src/logic/simulation.js');

console.log("=== Verifying Gambit Logic ===");

// Mock Stats
const playerStats = { opening: 1, midgame: 1, endgame: 1, tactics: 1, sacrifices: 250 }; // 250 * 0.2 = 50% chance
const enemyStats = { opening: 1, midgame: 1, endgame: 1, tactics: 1, sacrifices: 1 };

let triggerCount = 0;
let successCount = 0;
let failureCount = 0;
const ITERATIONS = 10000;

for (let i = 0; i < ITERATIONS; i++) {
    // Force Move > 5, hasSacrificed = false
    const result = calculateMove(10, playerStats, enemyStats, 0.0, {}, false, 0, 'rapid', false);

    if (result.hasSacrificed) {
        triggerCount++;
        if (result.sacrificeSwing === 5.0) successCount++;
        if (result.sacrificeSwing === -2.0) failureCount++;
    }
}

console.log(`Iterations: ${ITERATIONS}`);
console.log(`Triggers: ${triggerCount} (Expected ~${ITERATIONS * 0.02})`);
console.log(`Successes: ${successCount}`);
console.log(`Failures: ${failureCount}`);
console.log(`Success Rate: ${(successCount / triggerCount * 100).toFixed(1)}% (Expected ~50%)`);

if (triggerCount === 0) console.error("FAIL: Sacrifice never triggered.");
if (Math.abs((successCount / triggerCount) - 0.5) > 0.1) console.error("FAIL: Success rate deviated significantly from 50%.");

// Verify HasSacrificed Flag Persistance Logic (Simulation Loop simulation)
// If I pass hasSacrificed = true, it should never trigger again.
let reTrigger = 0;
for (let i = 0; i < 1000; i++) {
    const result = calculateMove(10, playerStats, enemyStats, 0.0, {}, false, 0, 'rapid', true);
    if (result.hasSacrificed) reTrigger++;
}
if (reTrigger > 0) console.error("FAIL: Sacrifice triggered again after being consumed.");
else console.log("PASS: Sacrifice correctly consumed.");

console.log("=== Gambit Verification Complete ===");
