// Mocking the logic from src/logic/simulation.js to audit distribution
const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices', 'defense'];

const getOpponentIdentity = (stats) => {
    let maxVal = -1;
    let maxKey = '';
    let minVal = Infinity;
    Object.entries(stats).forEach(([key, val]) => {
        if (val > maxVal) { maxVal = val; maxKey = key; }
        if (val < minVal) { minVal = val; }
    });
    const spread = maxVal - minVal;
    const isBalanced = (spread / maxVal) < 0.1;
    if (isBalanced) return "Solid Club Player";
    switch (maxKey) {
        case 'opening': return "Opening Master";
        case 'midgame': return "Midgame Maestro";
        case 'endgame': return "Carlsen's Student";
        case 'tactics': return "Little Tal";
        case 'sacrifices': return "Nezhmetdinov";
        case 'defense': return "The Swindler"; // Hikaru
        default: return "Unknown";
    }
};

const simulateDistribution = (targetElo) => {
    let totalStats = targetElo - 100;
    const numStats = STATS.length;

    // Minimum 1 per stat
    if (totalStats < numStats) totalStats = numStats;

    const stats = {
        opening: 1, midgame: 1, endgame: 1, tactics: 1, sacrifices: 1, defense: 1
    };

    let remainingPoints = totalStats - numStats;

    // Pure Random Distribution (Current Logic)
    while (remainingPoints > 0) {
        const randomStat = STATS[Math.floor(Math.random() * numStats)];
        stats[randomStat]++;
        remainingPoints--;
    }

    const title = getOpponentIdentity(stats);

    // Check Actual Sum
    const sum = Object.values(stats).reduce((a, b) => a + b, 0);
    const actualElo = 100 + sum;

    return {
        TargetElo: targetElo,
        ActualElo: actualElo,
        Stats: stats,
        Title: title
    };
};

console.log("=== OPPONENT GENERATION AUDIT ===");
const caseA = simulateDistribution(100);
const caseB = simulateDistribution(1000);
const caseC = simulateDistribution(3000);

console.log(JSON.stringify(caseA, null, 2));
console.log(JSON.stringify(caseB, null, 2));
console.log(JSON.stringify(caseC, null, 2));

console.log("\n=== ANALYSIS ===");
console.log(`Case C Sacrifice: ${caseC.Stats.sacrifices} (Cap is 500)`);
console.log(`Case C Defense: ${caseC.Stats.defense} vs Avg: ${(3000-100)/6}`);
