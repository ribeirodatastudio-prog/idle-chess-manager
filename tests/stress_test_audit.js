import { calculateMove, generateOpponentStats } from '../src/logic/simulation.js';

console.log("=== STARTING STRESS TEST AUDIT ===\n");

const scenarios = [
    { name: "Tier A (Low)", stats: 100 },
    { name: "Tier B (Standard)", stats: 10000 },
    { name: "Tier C (Stress)", stats: 1000000 }
];

const modes = ['rapid', 'bullet', 'chess960'];

function createStats(val) {
    return {
        opening: val, midgame: val, endgame: val,
        tactics: val, sacrifices: val, defense: val
    };
}

let aiSacrifices = 0;
let totalSacrifices = 0;
let bulletSacrifices = 0;

function runSimulation(scenarioName, statsVal, mode) {
    console.log(`\n--- SCENARIO: [${mode.toUpperCase()}] - [${scenarioName}] ---`);

    // Setup Stats
    const playerStats = createStats(statsVal);
    // Enemy slightly weaker to create varied deltas, but close enough
    const enemyStats = createStats(statsVal * 0.95);

    let currentEval = 0;
    let sacrificesCount = 0;

    // Run 50 turns
    for (let move = 1; move <= 50; move++) {
        const result = calculateMove(move, playerStats, enemyStats, currentEval, {}, false, 0, mode, sacrificesCount);

        // Log Turn 1
        if (move === 1) {
            console.log(`Turn 1: Eval ${result.newEval.toFixed(2)} | Delta ${result.delta.toFixed(2)} | Phase: ${result.phase}`);
            if (isNaN(result.newEval)) console.error("!!! FATAL: NaN detected on Turn 1 !!!");
        }

        // Log Phase Shift (Chess 960)
        if (mode === 'chess960' && (move === 9 || move === 11)) {
             console.log(`Turn ${move} (960 Check): Delta ${result.delta.toFixed(2)} | Phase: ${result.phase}`);
        }

        // Log Sacrifice
        if (result.hasSacrificed) {
            totalSacrifices++;
            if (mode === 'bullet') bulletSacrifices++;

            console.log(`> Event: Sacrifice! Turn ${move}. Msg: "${result.logMessage}"`);

            // Check for AI sacrifice based on log message
            // Updated for new explicit messages
            const msg = result.logMessage || "";
            if (msg.includes('!! OPPONENT SACRIFICE !!') || msg.includes('Opponent blunders a sacrifice!')) {
                 aiSacrifices++;
            }
        }

        // Deep Game
        if (move === 50) {
             console.log(`Turn 50: Result ${result.result} | Eval ${result.newEval.toFixed(2)}`);
        }

        currentEval = result.newEval;

        // In simulation, calculateMove returns sacrificesCount+1 if triggered.
        // We need to persist that state properly.
        sacrificesCount = result.sacrificesCount;

        if (result.result) break;
    }
}

// 1. Run Matrix
scenarios.forEach(scen => {
    modes.forEach(mode => {
        runSimulation(scen.name, scen.stats, mode);
    });
});

// 2. Specific Checks

// 1M Stat Check
console.log("\n--- CHECK: 1M Attack vs 500k Defense ---");
const p1M = createStats(1000000);
const e500k = createStats(500000);
const res1M = calculateMove(15, p1M, e500k, 0, {}, false, 0, 'rapid', 0);
console.log(`Result Delta: ${res1M.delta}`);
if (isFinite(res1M.delta) && !isNaN(res1M.delta)) {
    console.log("Conclusion: PASS (Valid Number)");
} else {
    console.log("Conclusion: FAIL (Infinity/NaN)");
}


// Gauntlet Scaling
console.log("\n--- CHECK: Gauntlet Scaling (Matches 1-3) ---");
// Check 5 Tiers
const tiersToCheck = [0, 2, 4, 6, 8];
tiersToCheck.forEach(tIndex => {
    console.log(`Tier Index ${tIndex}:`);
    const m1 = generateOpponentStats({tierIndex: tIndex, matchIndex: 0});
    const m2 = generateOpponentStats({tierIndex: tIndex, matchIndex: 1});
    const m3 = generateOpponentStats({tierIndex: tIndex, matchIndex: 2}); // Boss

    // Base Elo is hidden, but we can infer multipliers from totalPower ratios
    console.log(`  Match 1 Power: ${m1.totalPower}`);
    console.log(`  Match 2 Power: ${m2.totalPower} (Ratio: ${(m2.totalPower/m1.totalPower).toFixed(3)})`);
    console.log(`  Match 3 Power: ${m3.totalPower} (Ratio: ${(m3.totalPower/m1.totalPower).toFixed(3)})`);
});

// AI Agency Report
console.log("\n--- CHECK: AI Agency ---");
if (aiSacrifices > 0) {
    console.log("AI Sacrifices detected: " + aiSacrifices + " -> PASS");
} else {
    console.log("AI Sacrifices detected: 0 -> FAIL (Expected before fix)");
}

console.log("\n--- CHECK: Bullet Chaos ---");
console.log(`Total Bullet Sacrifices in runs: ${bulletSacrifices}`);
if (bulletSacrifices > 5) {
     console.log("Bullet frequency seems high -> PASS");
} else {
     console.log("Bullet frequency low -> WARNING");
}
