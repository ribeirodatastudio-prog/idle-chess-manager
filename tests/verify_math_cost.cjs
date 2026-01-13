const { calculateUpgradeCost } = require('../src/logic/math.js');

console.log("=== Verifying Math Logic (Cumulative Wall) ===");

// 1. Verify Level 49 (Buying 50) - Spike Start
const sac49 = calculateUpgradeCost(49, false, 'sacrifices');
const base49 = 1 * Math.pow(1.1, 48);
const expected49 = base49 * 1000;
console.log(`Lvl 49 (Buy 50): ${sac49.toFixed(2)}. Expected ~${expected49.toFixed(2)}`);

if (Math.abs(sac49 - expected49) > 1.0) console.error("FAIL: Lvl 49 cost mismatch.");

// 2. Verify Level 50 (Buying 51) - Spike Continued
const sac50 = calculateUpgradeCost(50, false, 'sacrifices');
const base50 = 1 * Math.pow(1.1, 49);
const expected50 = base50 * 1000;
console.log(`Lvl 50 (Buy 51): ${sac50.toFixed(2)}. Expected ~${expected50.toFixed(2)}`);

if (Math.abs(sac50 - expected50) > 1.0) {
    console.error("FAIL: Lvl 50 cost dropped significantly!");
} else {
    console.log("PASS: Wall maintained at Level 50.");
}

// 3. Verify Level 99 (Buying 100) - Double Spike
const sac99 = calculateUpgradeCost(99, false, 'sacrifices');
const base99 = 1 * Math.pow(1.1, 98);
const expected99 = base99 * 1000000; // 1000^2
console.log(`Lvl 99 (Buy 100): ${sac99.toExponential(2)}. Expected ~${expected99.toExponential(2)}`);

// Use ratio for large numbers
if (sac99 / base99 > 900000 && sac99 / base99 < 1100000) {
    console.log("PASS: Double Wall at Level 99.");
} else {
    console.error("FAIL: Double Wall logic incorrect.");
}

console.log("=== Math Verification Complete ===");
