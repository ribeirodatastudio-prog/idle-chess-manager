import { calculateMove } from '../src/logic/simulation.js';

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

console.log("=== Verifying New Skills Logic ===");

// 1. Test Deep Blue
// Player Power scales exponentially (1.02 ^ MoveNumber).
// We can't easily check internal variables, but we can check if delta is significantly higher with the skill vs without.
// Or we can rely on the fact that if we fix random to 1.0, the output is deterministic.
// calculateMove uses Math.random(). We should mock it or run many iterations.
// Let's use a mocked random for deterministic results.
const originalRandom = Math.random;
Math.random = () => 0.5; // Midpoint for ranges [0.95, 1.05] -> 1.0

try {
    // Baseline (No Skills)
    const resNoSkill = calculateMove(10, baseStats, baseStats, 0, {});

    // With Deep Blue at Move 10 (1.02^10 = ~1.219)
    const resDeepBlue = calculateMove(10, baseStats, baseStats, 0, { deep_blue: true });

    // Player Attack in NoSkill should be ~ (BaseSum * 0.5) * 1.0
    // Player Attack in DeepBlue should be ~ (BaseSum * 1.219 * 0.5) * 1.0
    // This should result in a higher Delta (Player - Enemy).

    assert(resDeepBlue.delta > resNoSkill.delta, `Deep Blue should increase player performance. NoSkill: ${resNoSkill.delta}, DeepBlue: ${resDeepBlue.delta}`);

} catch (e) {
    console.error("Error testing Deep Blue", e);
    failures++;
}

// 2. Test Time Trouble
// Move > 35 reduces enemy stats.
try {
    // Move 36. 1 - 0.04 * (36-35) = 0.96.
    const resNoSkill = calculateMove(36, baseStats, baseStats, 0, {});
    const resTimeTrouble = calculateMove(36, baseStats, baseStats, 0, { time_trouble: true });

    // Enemy Attack reduced -> Player Advantage increased (Delta higher).
    assert(resTimeTrouble.delta > resNoSkill.delta, `Time Trouble should reduce enemy power at move 36. NoSkill: ${resNoSkill.delta}, TimeTrouble: ${resTimeTrouble.delta}`);

} catch (e) {
    console.error("Error testing Time Trouble", e);
    failures++;
}

// 3. Test Lasker's Defense
// Double recovery if losing (< -1.0) and delta > 0.
try {
    // We need a situation where delta is positive.
    // Let's give player huge stats.
    const strongPlayer = { ...baseStats, midgame: 100 };
    const weakEnemy = { ...baseStats, midgame: 1 };

    // Scenario: Eval is -2.0.
    const resNormal = calculateMove(25, strongPlayer, weakEnemy, -2.0, {});
    const resLasker = calculateMove(25, strongPlayer, weakEnemy, -2.0, { lasker_defense: true });

    // Delta should be doubled.
    // Note: dampening might affect floating point comparison.
    // Check ratio.
    const ratio = resLasker.delta / resNormal.delta;
    assert(Math.abs(ratio - 2.0) < 0.1, `Lasker's Defense should double recovery. Normal: ${resNormal.delta}, Lasker: ${resLasker.delta}, Ratio: ${ratio}`);

} catch (e) {
    console.error("Error testing Lasker Defense", e);
    failures++;
}

// 4. Test Iron Curtain (Win Condition)
// Move 50, Eval > -8.0 -> Win.
try {
    const resNormal = calculateMove(50, baseStats, baseStats, -5.0, {});
    // Normal: Draw or loss depending on tie breaker. Eval -5.0 is likely not a win.

    const resIron = calculateMove(50, baseStats, baseStats, -5.0, { iron_curtain: true });

    assert(resIron.result === 'win', `Iron Curtain should win at move 50 with eval -5.0. Got: ${resIron.result}`);

    // Check for Mutation
    assert(baseStats.defense === 10, `Input Stats must NOT be mutated. Expected 10, Got: ${baseStats.defense}`);

} catch (e) {
    console.error("Error testing Iron Curtain", e);
    failures++;
}

// 5. Test Brilliant Bounty
// Needs successful sacrifice.
// We force random to trigger sacrifice (chance 0.02) and success (chance based on stats).
try {
    Math.random = () => 0.001; // Force sacrifice trigger (0.001 < 0.02) AND Success (0.001 < 10*0.2)

    const resBounty = calculateMove(15, baseStats, baseStats, 0, { brilliant_bounty: true });

    assert(resBounty.hasSacrificed === true, "Sacrifice should have triggered.");
    assert(resBounty.triggerBrilliantBounty === true, "Brilliant Bounty should trigger on success.");

    // Test without skill
    const resNoBounty = calculateMove(15, baseStats, baseStats, 0, {});
    assert(resNoBounty.triggerBrilliantBounty === false, "Brilliant Bounty should not trigger without skill.");

} catch (e) {
    console.error("Error testing Brilliant Bounty", e);
    failures++;
}

// 6. Test Decisive Blow
// Threshold 5.0.
try {
    Math.random = () => 0.5; // Reset

    // Eval 6.0. Normal threshold is 8.0 (no win). Decisive is 5.0 (win).
    // Note: calculateMove adds delta to currentEval.
    // If currentEval is 6.0 and delta is small, result ~6.0.

    const resNormal = calculateMove(20, baseStats, baseStats, 6.0, {});
    const resDecisive = calculateMove(20, baseStats, baseStats, 6.0, { decisive_blow: true });

    // Normal should continue (result null) or not win if threshold 8.
    // Decisive should win.

    assert(resNormal.result !== 'win', `Normal threshold (8.0) should not win at 6.0. Got: ${resNormal.result}`);
    assert(resDecisive.result === 'win', `Decisive Blow threshold (5.0) should win at 6.0. Got: ${resDecisive.result}`);

} catch (e) {
    console.error("Error testing Decisive Blow", e);
    failures++;
}

// Restore Random
Math.random = originalRandom;

if (failures === 0) {
    console.log("ALL TESTS PASSED");
    process.exit(0);
} else {
    console.error(`${failures} TESTS FAILED`);
    process.exit(1);
}
