import { calculateMove, getPhaseConfig } from '../src/logic/simulation.js';

const runTest = () => {
    console.log("Starting Sacrifice Success Rate Audit (Bullet Mode)...");

    const iterations = 10000;
    let successCount = 0;
    let failCount = 0;

    // Mock Stats: 350 Sacrifice -> 70% Success Chance (Base)
    const rawPlayerStats = {
        opening: 100,
        midgame: 100,
        endgame: 100,
        tactics: 100,
        sacrifices: 350,
        defense: 100
    };

    const rawEnemyStats = {
        opening: 100,
        midgame: 100,
        endgame: 100,
        tactics: 100,
        sacrifices: 100,
        defense: 100
    };

    // Skills: mid_gambit forces a sacrifice at move 25
    const skills = {
        mid_gambit: 1
    };

    // Need phase config
    const phaseConfig = getPhaseConfig(skills);

    console.log("Mock Stats:", rawPlayerStats);
    console.log("Mode: bullet");
    console.log("Expecting: ~70% Success Rate (if fix applied), ~7% (if bugged)");

    for (let i = 0; i < iterations; i++) {
        const result = calculateMove(
            25, // Move 25 (Midgame Gambit Trigger)
            rawPlayerStats,
            rawEnemyStats,
            0, // Current Eval
            skills,
            false, // Phase 1 Won
            0, // Move 11 Eval
            'bullet', // MODE: BULLET
            0, // Sac Count
            phaseConfig,
            false // Phase 2 Won
        );

        if (result.hasSacrificed) {
            // Check result
            // Sacrifice Swing +5.0 means success for Player
            // Sacrifice Swing -2.0 means failure for Player
            if (result.sacrificeSwing === 5.0) {
                successCount++;
            } else if (result.sacrificeSwing === -2.0) {
                failCount++;
            }
        }
    }

    const total = successCount + failCount;
    const rate = total > 0 ? (successCount / total) * 100 : 0;

    console.log(`Iterations: ${iterations}`);
    console.log(`Sacrifices Triggered: ${total}`);
    console.log(`Successes: ${successCount}`);
    console.log(`Failures: ${failCount}`);
    console.log(`Real Win Rate: ${rate.toFixed(2)}%`);

    if (rate < 15) {
        console.log("FAIL: Win Rate is anomalously low (likely clamped/multiplied).");
    } else if (rate > 65 && rate < 75) {
        console.log("PASS: Win Rate matches expected stat.");
    } else {
        console.log(`WARN: Win Rate is unexpected (${rate.toFixed(2)}%).`);
    }
};

runTest();
