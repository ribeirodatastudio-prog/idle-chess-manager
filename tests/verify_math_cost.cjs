const { calculateUpgradeCost } = require('../src/logic/math.js');

console.log("=== Verifying Math Logic ===");

// 1. Verify Standard Stat
const opening49 = calculateUpgradeCost(49, false, 'opening');
const opening50 = calculateUpgradeCost(50, false, 'opening'); // No spike (50 % 100 != 0)
console.log(`Opening Lvl 49 Cost: ${opening49.toFixed(2)}`);
console.log(`Opening Lvl 50 Cost: ${opening50.toFixed(2)}`);
if (opening50 > opening49 * 2) console.error("FAIL: Unexpected spike for Opening at 50");

// 2. Verify Sacrifice Wall
const sac49 = calculateUpgradeCost(49, false, 'sacrifices');
const sac50 = calculateUpgradeCost(50, false, 'sacrifices'); // Should spike (51 % 50 != 0... wait. Formula is (currentLevel + 1) % 50 === 0)
// If I am AT level 49, upgrading TO 50. cost is calculated for currentLevel=49.
// Formula check: (49 + 1) % 50 === 0 -> True. So upgrading FROM 49 TO 50 triggers the spike.
// Wait, "The Wall: Every 50th level (50, 100, 150...)" implies the cost to REACH 50 or reach 51?
// "Every 50th level apply an additional 1000x multiplier to the cost" usually means the milestone is hard to pass.
// If I am at 49, buying 50. This is the 50th level.
// Code: `if ((currentLevel + 1) % 50 === 0)` -> 50 % 50 === 0. Yes.
console.log(`Sacrifice Lvl 49 (Buy 50): ${sac49.toFixed(2)}`);
console.log(`Ratio: ${sac49 / (1 * Math.pow(1.1, 48))}`); // Should be ~1000 * 1.1? No, just 1000 * base growth.
// Base at 49 = 1.1^48.
// Cost = Base * 1000?

const expectedBase49 = 1 * Math.pow(1.1, 48);
if (sac49 > expectedBase49 * 900) {
    console.log("PASS: Wall detected at Level 49 (Buying 50)");
} else {
    console.error(`FAIL: Wall missing at Level 49. Cost: ${sac49}, Expected > ${expectedBase49 * 900}`);
}

const sac50_buy51 = calculateUpgradeCost(50, false, 'sacrifices');
console.log(`Sacrifice Lvl 50 (Buy 51): ${sac50_buy51.toFixed(2)}`);
// Should return to normal growth relative to base.
// Base at 50 = 1.1^49.
const expectedBase50 = 1 * Math.pow(1.1, 49);
if (sac50_buy51 < expectedBase50 * 5) {
     console.log("PASS: Wall gone at Level 50 (Buying 51)");
} else {
    console.error("FAIL: Wall persisted or unexpected spike at 50");
}

console.log("=== Math Verification Complete ===");
