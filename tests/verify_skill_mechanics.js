import { calculateMove, getPhaseConfig } from '../src/logic/simulation.js';

// Mock Stats
const baseStats = {
    opening: 10,
    midgame: 10,
    endgame: 10,
    tactics: 10,
    sacrifices: 10,
    defense: 10
};

let failures = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        failures++;
    } else {
        console.log(`[PASS] ${message}`);
    }
}

console.log("=== Verifying Skill Mechanics ===");

// 1. Verify getPhaseConfig
console.log("--- 1. Phase Configuration ---");
const skills1 = { op_extender: 3, mid_extender: 2, end_extender: 3 };
const config1 = getPhaseConfig(skills1);
// Opening: 10 + 3 = 13
// Midgame: 30 + 3 + 2 = 35
// MaxTurns: 50 + 3 = 53
assert(config1.openingEnd === 13, `Opening End should be 13. Got: ${config1.openingEnd}`);
assert(config1.midgameEnd === 35, `Midgame End should be 35. Got: ${config1.midgameEnd}`);
assert(config1.maxTurns === 53, `Max Turns should be 53. Got: ${config1.maxTurns}`);

// 2. Verify Eval Injection
console.log("--- 2. Eval Injection ---");
// Turn 1: op_caro
const skills2 = { op_caro: 2 }; // +0.2
const res2 = calculateMove(1, baseStats, baseStats, 0, skills2, false, 0, 'rapid', 0, getPhaseConfig(skills2));
// calculateMove adds delta to currentEval. Delta includes random.
// To isolate injection, we'd need to mock random or repeat many times?
// Actually, delta is calculated. The boost is added to delta.
// If we can't mock random easily without modifying global, let's assume random is reasonable.
// BUT, simulation.js doesn't expose random.
// We can use a trick: If we set stats to 0, or huge, does it help?
// Or we can mock Math.random.
const originalRandom = Math.random;
Math.random = () => 0.5; // Neutral

const res2Base = calculateMove(1, baseStats, baseStats, 0, {}, false, 0, 'rapid', 0, getPhaseConfig({}));
const res2Boost = calculateMove(1, baseStats, baseStats, 0, skills2, false, 0, 'rapid', 0, getPhaseConfig(skills2));
// Difference should be exactly 0.2
const diff2 = res2Boost.delta - res2Base.delta;
assert(Math.abs(diff2 - 0.2) < 0.0001, `Turn 1 Boost should be 0.2. Got diff: ${diff2}`);

// Turn OpeningEnd + 1: mid_boost
const skills3 = { op_extender: 0, mid_boost: 3 }; // +0.3 at turn 11 (10+1)
const res3Base = calculateMove(11, baseStats, baseStats, 0, {}, false, 0, 'rapid', 0, getPhaseConfig({}));
const res3Boost = calculateMove(11, baseStats, baseStats, 0, skills3, false, 0, 'rapid', 0, getPhaseConfig(skills3));
const diff3 = res3Boost.delta - res3Base.delta;
assert(Math.abs(diff3 - 0.3) < 0.0001, `Midgame Start Boost should be 0.3. Got diff: ${diff3}`);

// Turn MidgameEnd + 1: end_boost
const skills4 = { op_extender: 0, mid_extender: 0, end_boost: 1 }; // +0.1 at turn 31
const res4Base = calculateMove(31, baseStats, baseStats, 0, {}, false, 0, 'rapid', 0, getPhaseConfig({}));
const res4Boost = calculateMove(31, baseStats, baseStats, 0, skills4, false, 0, 'rapid', 0, getPhaseConfig(skills4));
const diff4 = res4Boost.delta - res4Base.delta;
assert(Math.abs(diff4 - 0.1) < 0.0001, `Endgame Start Boost should be 0.1. Got diff: ${diff4}`);

// 3. Verify Scripted Sacrifices
console.log("--- 3. Scripted Sacrifices ---");
// Turn 5: op_gambit
const skills5 = { op_gambit: 1, brilliant_bounty: false };
// Reset random to force failure if chance based, but we want to verify it triggers regardless of chance.
// Normal sacrifice chance is 0.02.
// We force random to 0.9 (fail normal check).
Math.random = () => 0.9;

// However, success check is `min(sac * 0.2, 100)`. 10 * 0.2 = 2%.
// Roll is 0.9 -> 90. 90 < 2 is False. So sacrifice fails (-2.0 swing).
// We just want to check `hasSacrificed` is true and `sacrificesCount` did not increment.

const res5 = calculateMove(5, baseStats, baseStats, 0, skills5, false, 0, 'rapid', 0, getPhaseConfig(skills5));
assert(res5.hasSacrificed === true, `Turn 5 Gambit should trigger sacrifice.`);
assert(res5.sacrificesCount === 0, `Scripted Sacrifice should NOT increment count. Got: ${res5.sacrificesCount}`);

// Verify normal logic doesn't trigger at Turn 5
const res5Normal = calculateMove(5, baseStats, baseStats, 0, {}, false, 0, 'rapid', 0, getPhaseConfig({}));
assert(res5Normal.hasSacrificed === false, `Turn 5 should not trigger normal sacrifice.`);

// Turn 25: mid_gambit
const skills6 = { mid_gambit: 1 };
const res6 = calculateMove(25, baseStats, baseStats, 0, skills6, false, 0, 'rapid', 1, getPhaseConfig(skills6)); // Count 1
assert(res6.hasSacrificed === true, `Turn 25 Gambit should trigger sacrifice.`);
assert(res6.sacrificesCount === 1, `Scripted Sacrifice should NOT increment count (Input 1 -> Output 1).`);

// Turn 35: end_gambit
const skills7 = { end_gambit: 1 };
const res7 = calculateMove(35, baseStats, baseStats, 0, skills7, false, 0, 'rapid', 2, getPhaseConfig(skills7)); // Count 2 (Max for blitz?)
assert(res7.hasSacrificed === true, `Turn 35 Gambit should trigger sacrifice.`);
assert(res7.sacrificesCount === 2, `Scripted Sacrifice should NOT increment count.`);


// 4. Verify Phase Extension Logic in Simulation
console.log("--- 4. Phase Boundaries ---");
// Check Turn 12 with op_extender 3 (Opening ends 13). Turn 12 should be Opening.
const skills8 = { op_extender: 3 };
const config8 = getPhaseConfig(skills8); // Opening End 13
const res8 = calculateMove(12, baseStats, baseStats, 0, skills8, false, 0, 'rapid', 0, config8);
assert(res8.phase === 'Opening', `Turn 12 should be Opening with extender. Got: ${res8.phase}`);

// Check Turn 12 without extender. Should be Midgame.
const config8b = getPhaseConfig({}); // Opening End 10
const res8b = calculateMove(12, baseStats, baseStats, 0, {}, false, 0, 'rapid', 0, config8b);
assert(res8b.phase === 'Midgame', `Turn 12 should be Midgame without extender. Got: ${res8b.phase}`);

// Restore Random
Math.random = originalRandom;

if (failures === 0) {
    console.log("ALL TESTS PASSED");
    process.exit(0);
} else {
    console.error(`${failures} TESTS FAILED`);
    process.exit(1);
}
