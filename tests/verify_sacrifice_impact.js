import { calculateSacrificeImpact } from '../src/logic/simulation.js';

const runTests = () => {
    console.log("Starting Sacrifice Impact Logic Audit...");
    let passed = 0;
    let failed = 0;

    const assert = (desc, actual, expected) => {
        // Allow small float error or exact string match if rounded
        const isMatch = Math.abs(actual - expected) < 0.001;
        if (isMatch) {
            console.log(`[PASS] ${desc}: Got ${actual}`);
            passed++;
        } else {
            console.error(`[FAIL] ${desc}: Expected ${expected}, Got ${actual}`);
            failed++;
        }
    };

    // --- 1. Classical Mode (3.0 - 6.0) ---
    // Success Scenarios
    // r = 1.0 (Equal) -> alpha = 0 -> Min (3.0)
    // r = 2.5 (Domination) -> alpha = 1 -> Max (6.0)
    // r = 1.75 -> alpha = sqrt(0.75/1.5) = sqrt(0.5) = 0.7071
    // Val = 3.0 + (3.0 * 0.7071) = 3.0 + 2.1213 = 5.12

    // Test 1: Classical Success, Equal Stats
    // We can't run this until the function exists.
    // But assuming strict TDD, I'm defining the expectations here.

    try {
        // Mock function call if it doesn't exist yet?
        // No, this script is intended to run AFTER implementation.

        // Classical Success Equal
        assert('Classical Success (Equal)', calculateSacrificeImpact('classical', true, 100, 100), 3.00);

        // Classical Success Domination (2.5x)
        assert('Classical Success (Max)', calculateSacrificeImpact('classical', true, 250, 100), 6.00);

        // Classical Success Mid (1.75x)
        assert('Classical Success (Mid)', calculateSacrificeImpact('classical', true, 175, 100), 5.12);

        // Classical Failure Equal
        // Base Max (6.0) - (Range 3.0 * 0) = 6.0 -> Result -6.00
        assert('Classical Fail (Equal)', calculateSacrificeImpact('classical', false, 100, 100), -6.00);

        // Classical Failure Mitigation (High Defense 2.5x)
        // Base Max (6.0) - (Range 3.0 * 1) = 3.0 -> Result -3.00
        // Numerator (PlayerDefense) = 250, Denominator (EnemyTactics) = 100
        assert('Classical Fail (Mitigated)', calculateSacrificeImpact('classical', false, 250, 100), -3.00);

        // --- 2. Rapid Mode (2.0 - 5.0) ---
        // Range = 3.0.
        // Success Equal: 2.0
        assert('Rapid Success (Equal)', calculateSacrificeImpact('rapid', true, 100, 100), 2.00);

        // --- 3. Blitz Mode (1.0 - 4.0) ---
        // Range = 3.0.
        assert('Blitz Success (Equal)', calculateSacrificeImpact('blitz', true, 100, 100), 1.00);

        // --- 4. Bullet Mode (0.5 - 3.0) ---
        // Range = 2.5.
        // Success Equal: 0.5
        assert('Bullet Success (Equal)', calculateSacrificeImpact('bullet', true, 100, 100), 0.50);
        // Success Max: 3.0
        assert('Bullet Success (Max)', calculateSacrificeImpact('bullet', true, 250, 100), 3.00);

        // --- 5. Chess960 (Same as Classical) ---
        assert('Chess960 Success (Equal)', calculateSacrificeImpact('chess960', true, 100, 100), 3.00);

        // --- 6. Edge Cases ---
        // Division by Zero (Defense 0) -> Should clamp to Max (alpha=1) probably? Or handle gracefully.
        // Prompt says "Ensure inputs are sanitized (avoid division by zero)".
        // Ideally treat 0 as 1 or effectively infinite ratio -> Max Reward.
        assert('Zero Defense (Max Reward)', calculateSacrificeImpact('classical', true, 100, 0), 6.00);

        // r < 1 (Disadvantage) -> alpha = 0 -> Min Reward
        assert('Underdog Success (Baseline)', calculateSacrificeImpact('classical', true, 50, 100), 3.00);

    } catch (e) {
        console.error("Error running tests:", e);
        failed++;
    }

    console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
};

runTests();
