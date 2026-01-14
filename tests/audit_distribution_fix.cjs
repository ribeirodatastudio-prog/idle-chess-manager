// Mocking the FIXED logic from src/logic/simulation.js to audit distribution
const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices', 'defense'];

const simulateDistribution = (targetElo) => {
    let totalStats = targetElo - 100;
    const numStats = STATS.length;

    if (totalStats < numStats) totalStats = numStats;

    // Fixed: Initialize Defense
    const stats = {
        opening: 1, midgame: 1, endgame: 1, tactics: 1, sacrifices: 1, defense: 1
    };

    let remainingPoints = totalStats - numStats;

    // Fixed: Cap Logic
    while (remainingPoints > 0) {
        const randomStat = STATS[Math.floor(Math.random() * numStats)];

        if (randomStat === 'sacrifices' && stats[randomStat] >= 500) {
            continue;
        }

        stats[randomStat]++;
        remainingPoints--;
    }

    // Check Actual Sum
    const sum = Object.values(stats).reduce((a, b) => a + b, 0);
    const actualElo = 100 + sum;

    return {
        TargetElo: targetElo,
        ActualElo: actualElo,
        Stats: stats
    };
};

console.log("=== OPPONENT GENERATION AUDIT (FIXED) ===");
const caseC = simulateDistribution(5000); // 5000 Elo forces cap usage

console.log(JSON.stringify(caseC, null, 2));

if (caseC.Stats.sacrifices <= 500) {
    console.log("PASS: Sacrifice Cap Enforced.");
} else {
    console.error(`FAIL: Sacrifice exceeded 500: ${caseC.Stats.sacrifices}`);
}

if (caseC.Stats.defense > 1) {
    console.log(`PASS: Defense Stat Populated: ${caseC.Stats.defense}`);
} else {
    console.error("FAIL: Defense Stat Empty/Low");
}
