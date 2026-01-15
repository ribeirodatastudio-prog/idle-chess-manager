const { calculateUpgradeCost } = require('../src/logic/math.js');

console.log("=== Verifying Growth Logic Update ===");

function checkStat(name, levelA, levelB, interval, expectedRatioMin, expectedRatioMax, description) {
    const costA = calculateUpgradeCost(levelA, false, name);
    const costB = calculateUpgradeCost(levelB, false, name);
    const ratio = costB / costA;

    console.log(`[${name}] Lvl ${levelA}->${levelB} (Buying ${levelA+1}->${levelB+1})`);
    console.log(`Cost A: ${costA.toExponential(2)}`);
    console.log(`Cost B: ${costB.toExponential(2)}`);
    console.log(`Ratio: ${ratio.toFixed(2)}`);

    if (ratio >= expectedRatioMin && ratio <= expectedRatioMax) {
        console.log(`PASS: ${description}`);
        return true;
    } else {
        console.log(`FAIL: ${description} (Expected ratio between ${expectedRatioMin}-${expectedRatioMax})`);
        return false;
    }
}

let allPass = true;

// 1. Check Defense at 75 boundary
// Level 73 (Buy 74) -> Level 74 (Buy 75)
// With new logic: Level 74 (Buy 75) => (74+1)/75 = 1. Spike!
// Ratio should be approx 1.1 * 5 = 5.5
console.log("\n--- Checking Defense (Target: 75 level interval) ---");
if (!checkStat('defense', 73, 74, 75, 5.4, 5.6, "Spike at Level 75")) allPass = false;

// 2. Check Defense Permanent Spike
// Level 74 (Buy 75) -> Level 75 (Buy 76)
// Both should be in Tier 1. Ratio should be normal 1.1
if (!checkStat('defense', 74, 75, 75, 1.05, 1.15, "Permanent Spike (Ratio stays ~1.1)")) allPass = false;

// 3. Check Opening at 100 boundary (Control)
// Level 98 (Buy 99) -> Level 99 (Buy 100)
// Spike expected. Ratio ~5.5
console.log("\n--- Checking Opening (Target: 100 level interval) ---");
if (!checkStat('opening', 98, 99, 100, 5.4, 5.6, "Spike at Level 100")) allPass = false;

// 4. Check Opening Permanent Spike
// Level 99 (Buy 100) -> Level 100 (Buy 101)
// Current logic: Fails (Ratio ~0.2)
// Target logic: Pass (Ratio ~1.1)
if (!checkStat('opening', 99, 100, 100, 1.05, 1.15, "Permanent Spike (Ratio stays ~1.1)")) allPass = false;


if (allPass) {
    console.log("\nALL CHECKS PASSED");
    process.exit(0);
} else {
    console.log("\nSOME CHECKS FAILED");
    process.exit(1);
}
