const { calculateUpgradeCost } = require('../src/logic/math.js');

console.log("=== Verifying Tiered Geometric Progression ===");

function verify(desc, actual, expected, tolerancePercent = 0.01) {
    const ratio = actual / expected;
    // Handle Infinity
    if (!isFinite(actual) && !isFinite(expected)) {
        console.log(`PASS: ${desc} -> Infinity (Expected Infinity)`);
        return true;
    }

    const diff = Math.abs(ratio - 1);
    const pass = diff < tolerancePercent;

    // Formatting for display
    let actualStr = actual < 1000000 ? actual.toFixed(4) : actual.toExponential(4);
    let expectedStr = expected < 1000000 ? expected.toFixed(4) : expected.toExponential(4);

    if (pass) {
        console.log(`PASS: ${desc} -> ${actualStr}`);
    } else {
        console.error(`FAIL: ${desc} -> Got ${actualStr}, Expected ${expectedStr} (Diff ${diff.toFixed(4)})`);
    }
    return pass;
}

// === STANDARD STATS ===
console.log("\n--- Standard Stats (Opening/Defense/etc) ---");

// 1. Level 1 (Buy 1) - Base
const std1 = calculateUpgradeCost(0, false, 'opening'); // Buy Lvl 1
verify("Lvl 1 (Base)", std1, 1.0);

// 2. Level 500 (Buy 500) - Tier 1 End
const std500 = calculateUpgradeCost(499, false, 'opening');
const expStd500 = Math.pow(1.03, 499);
verify("Lvl 500 (Tier 1 End)", std500, expStd500);

// 3. Level 501 (Buy 501) - Tier 2 Start
const std501 = calculateUpgradeCost(500, false, 'opening');
verify("Lvl 501 (Tier 2 Start)", std501, std500 * 1.08);

// 4. Level 10000 (Buy 10000) - Tier 2 End
const std10000 = calculateUpgradeCost(9999, false, 'opening');
// We verify relative to 500 to ensure chain holds
const expStd10000 = std500 * Math.pow(1.08, 9500);
verify("Lvl 10000 (Tier 2 End)", std10000, expStd10000);

// 5. Level 10001 (Buy 10001) - Tier 3 Start
const std10001 = calculateUpgradeCost(10000, false, 'opening');
verify("Lvl 10001 (Tier 3 Start)", std10001, std10000 * 1.15);


// === SACRIFICE STATS ===
console.log("\n--- Sacrifice Stats ---");

// 1. Level 1 (Buy 1) - Base
const sac1 = calculateUpgradeCost(0, false, 'sacrifices');
verify("Sacrifice Lvl 1 (Base)", sac1, 1.0);

// 2. Level 100 (Buy 100) - Tier 1 End
const sac100 = calculateUpgradeCost(99, false, 'sacrifices');
const expSac100 = Math.pow(1.10, 99);
verify("Sacrifice Lvl 100 (Tier 1 End)", sac100, expSac100);

// 3. Level 101 (Buy 101) - Tier 2 Start
const sac101 = calculateUpgradeCost(100, false, 'sacrifices');
verify("Sacrifice Lvl 101 (Tier 2 Start)", sac101, sac100 * 1.15);

// 4. Level 300 (Buy 300) - Tier 2 End
const sac300 = calculateUpgradeCost(299, false, 'sacrifices');
const expSac300 = sac100 * Math.pow(1.15, 200);
verify("Sacrifice Lvl 300 (Tier 2 End)", sac300, expSac300);

// 5. Level 301 (Buy 301) - Tier 3 Start
const sac301 = calculateUpgradeCost(300, false, 'sacrifices');
verify("Sacrifice Lvl 301 (Tier 3 Start)", sac301, sac300 * 1.20);

console.log("\n=== Verification Complete ===");
