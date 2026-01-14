const { calculatePassiveIncomePerMinute } = require('../src/logic/math.js');

console.log("=== Verifying Cumulative Economy Logic ===");

// Scenario: Rapid T4, Blitz T2, Classical T3.
// Total Index = 4 + 2 + 3 = 9.
const cumulativeIdx = 9;

// Expected: (1 + 9) * 1.05^9.
// 10 * 1.5513 = 15.513.
const rate = calculatePassiveIncomePerMinute(cumulativeIdx);
console.log(`Cumulative Index 9: ${rate.toFixed(3)}/min`);

const expected = 10 * Math.pow(1.05, 9);
if (Math.abs(rate - expected) < 0.001) {
    console.log(`PASS: Rate matches expected ${expected.toFixed(3)}`);
} else {
    console.error(`FAIL: Rate ${rate} != Expected ${expected}`);
}

console.log("=== Verification Complete ===");
