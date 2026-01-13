const { calculateMove } = require('../src/logic/simulation.js');

console.log("=== Verifying Mitigation Logic ===");

const createStats = (base, defense) => ({
    opening: base, midgame: base, endgame: base, tactics: base, sacrifices: 1, defense: defense
});

// Helper to extract delta from a run (avg of 10 runs to smooth random)
const getAvgDelta = (pStats, eStats) => {
    let total = 0;
    for(let i=0; i<50; i++) {
        const res = calculateMove(15, pStats, eStats, 0, {}, false, 0, 'rapid', false);
        total += res.delta;
    }
    return total / 50;
};

// Case 1: Equal Stats (Base 100, Def 100)
// Raw ~ 100 * 0.5 = 50.
// Mit ~ 100 * 0.5 = 50.
// Eff ~ Max(10, 50-50=0) = 10.
// Delta ~ (10 - 10) * 0.1 = 0.
const equal = getAvgDelta(createStats(100, 100), createStats(100, 100));
console.log(`Equal Stats Delta: ${equal.toFixed(3)} (Expected ~0)`);

// Case 2: Player High Attack (Base 200) vs Enemy Low Defense (100)
// P.Raw ~ 100. P.Mit ~ 50.
// E.Raw ~ 50. E.Mit ~ 50.
// P.Eff ~ 100 - 50 = 50.
// E.Eff ~ Max(10, 50-100=-50) = 10.
// Delta ~ (50 - 10) * 0.1 = 4.0.
const advantage = getAvgDelta(createStats(200, 100), createStats(100, 200));
// Note: Opponent stats in createStats(100, 200) means Base 100, Defense 200.
// My logic above assumed Enemy Def 100. Let's fix.
// Scenario: Player(Att=200, Def=100) vs Enemy(Att=100, Def=100).
const highAttLowDef = getAvgDelta(createStats(200, 100), createStats(100, 100));
console.log(`High Att vs Low Def Delta: ${highAttLowDef.toFixed(3)} (Expected ~4.0)`);

// Case 3: Infinite Defense (Piercing Floor Check)
// Player(Att=100, Def=100) vs Enemy(Att=100, Def=10000).
// P.Raw ~ 50. E.Mit ~ 5000.
// P.Eff ~ Max(10, -4950) = 10 (Floor).
// E.Raw ~ 50. P.Mit ~ 50.
// E.Eff ~ Max(10, 0) = 10.
// Delta ~ 0.
const infDef = getAvgDelta(createStats(100, 100), createStats(100, 10000));
console.log(`Infinite Defense Delta: ${infDef.toFixed(3)} (Expected ~0)`);

// Wait, if P.Eff is 10 (floor) and E.Eff is 10 (mitigated), Delta is 0.
// Let's try Player Att 200 vs Infinite Defense.
// P.Raw ~ 100. P.Eff ~ 20 (20% floor).
// E.Raw ~ 50. E.Eff ~ 10 (mitigated by P.Def 100).
// Delta ~ (20 - 10) * 0.1 = 1.0.
const piercing = getAvgDelta(createStats(200, 100), createStats(100, 10000));
console.log(`Piercing Check (200 Att vs 10k Def): ${piercing.toFixed(3)} (Expected ~1.0)`);

if (Math.abs(piercing - 1.0) > 0.5) console.error("FAIL: Piercing logic seems off.");
else console.log("PASS: Piercing logic verified.");

console.log("=== Verification Complete ===");
