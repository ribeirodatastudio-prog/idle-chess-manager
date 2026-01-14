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
// MIDGAME: P.Base = 100 + 100*0.8 = 180. E.Base = 180.
// P.Raw ~ 90. E.Raw ~ 90.
// P.Eff ~ 90-50=40. E.Eff ~ 90-50=40.
// Delta ~ (40-40)*0.1 = 0.
const equal = getAvgDelta(createStats(100, 100), createStats(100, 100));
console.log(`Equal Stats Delta: ${equal.toFixed(3)} (Expected ~0)`);

// Case 2: Player High Attack (Base 200) vs Enemy Low Defense (100)
// MIDGAME: P.Base = 200 + 200*0.8 = 360. E.Base = 100 + 100*0.8 = 180.
// P.Raw ~ 180. E.Raw ~ 90.
// P.Eff ~ 180 - 50 = 130. E.Eff ~ 90 - 50 = 40.
// Delta ~ (130 - 40) * 0.1 = 9.0
const playerAdvantage = getAvgDelta(createStats(200, 100), createStats(100, 100));
console.log(`High Att vs Low Def Delta: ${playerAdvantage.toFixed(3)} (Expected ~9.0)`);

// Case 3: Infinite Defense (Piercing Floor Check)
// Player(Att=100, Def=100) vs Enemy(Att=100, Def=10000).
// P.Base=180, E.Base=180. P.Raw~90, E.Raw~90.
// P.Eff ~ Max(90*0.2, 90-5000) = 18 (Floor).
// E.Eff ~ Max(90*0.2, 90-50) = 40.
// Delta ~ (18 - 40) * 0.1 = -2.2
const infDef = getAvgDelta(createStats(100, 100), createStats(100, 10000));
console.log(`Infinite Defense Delta: ${infDef.toFixed(3)} (Expected ~-2.2)`);

// Case 4: High Attack vs Infinite Defense
// P.Base=360, E.Base=180. P.Raw~180, E.Raw~90.
// P.Eff ~ Max(180*0.2, 180-5000) = 36 (Floor).
// E.Eff ~ Max(90*0.2, 90-50) = 40.
// Delta ~ (36 - 40) * 0.1 = -0.4
const piercing = getAvgDelta(createStats(200, 100), createStats(100, 10000));
console.log(`Piercing Check (200 Att vs 10k Def): ${piercing.toFixed(3)} (Expected ~-0.4)`);

if (Math.abs(piercing - -0.4) > 0.5) console.error("FAIL: Piercing logic seems off.");
else console.log("PASS: Piercing logic verified.");

console.log("=== Verification Complete ===");