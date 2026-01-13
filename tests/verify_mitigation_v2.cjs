const { calculateMove } = require('../src/logic/simulation.js');

console.log("=== Verifying Mitigation Logic (Corrected Expectations) ===");

const createStats = (base, defense) => ({
    opening: base, midgame: base, endgame: base, tactics: base, sacrifices: 1, defense: defense
});

const getAvgDelta = (pStats, eStats) => {
    let total = 0;
    for(let i=0; i<100; i++) {
        // Move 15 = Midgame. Tactics Weight 0.8.
        const res = calculateMove(15, pStats, eStats, 0, {}, false, 0, 'rapid', false);
        total += res.delta;
    }
    return total / 100;
};

// Case 1: Equal Stats (100 vs 100)
// Base = 100 + 80 = 180. Raw = 90.
// Mit = 50.
// Eff = Max(18, 40) = 40.
// Delta = (40 - 40) * 0.1 = 0.
const equal = getAvgDelta(createStats(100, 100), createStats(100, 100));
console.log(`Equal Stats: ${equal.toFixed(3)} (Expected ~0)`);

// Case 2: High Att (200) vs Low Def (100)
// P.Base = 200 + 160 = 360. P.Raw = 180.
// E.Mit = 50.
// P.Eff = Max(36, 130) = 130.
// E.Base = 180. E.Raw = 90.
// P.Mit = 50.
// E.Eff = Max(18, 40) = 40.
// Delta = (130 - 40) * 0.1 = 9.0.
const highAtt = getAvgDelta(createStats(200, 100), createStats(100, 100));
console.log(`High Att: ${highAtt.toFixed(3)} (Expected ~9.0)`);
if (Math.abs(highAtt - 9.0) > 1.0) console.error("FAIL: Damage calculation wrong.");

// Case 3: Piercing (200 Att vs 10,000 Def)
// P.Raw = 180. E.Mit = 5000.
// P.Eff = Max(36, -4820) = 36. (Floor Works!)
// E.Raw = 90. P.Mit = 50.
// E.Eff = 40.
// Delta = (36 - 40) * 0.1 = -0.4.
const piercing = getAvgDelta(createStats(200, 100), createStats(100, 10000));
console.log(`Piercing: ${piercing.toFixed(3)} (Expected ~ -0.4)`);

// To prove Piercing works, compare to Non-Piercing Scenario (if floor didn't exist, P.Eff would be 0 or neg).
// If P.Eff was 0, Delta would be (0 - 40)*0.1 = -4.0.
// Since actual is -0.4, the floor IS working (contributing +3.6 delta relative to 0).

if (piercing > -1.0 && piercing < 0.0) {
    console.log("PASS: Piercing floor is active (Damage > 0 despite infinite defense).");
} else {
    console.error("FAIL: Piercing floor not working.");
}

console.log("=== Verification Complete ===");
