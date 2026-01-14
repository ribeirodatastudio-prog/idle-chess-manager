const { calculatePassiveIncomePerMinute } = require('../src/logic/math.js');

console.log("=== Verifying Economy Logic ===");

const verifyRate = (idx, expectedBase) => {
    const rate = calculatePassiveIncomePerMinute(idx);
    const expected = (1 + idx) * Math.pow(1.05, idx);
    console.log(`Index ${idx}: ${rate.toFixed(3)}/min (Expected ~${expected.toFixed(3)})`);
    if (Math.abs(rate - expected) > 0.001) console.error("FAIL: Rate mismatch");
};

verifyRate(0, 1.0); // (1+0) * 1.05^0 = 1
verifyRate(1, 2.1); // (1+1) * 1.05^1 = 2 * 1.05 = 2.1
verifyRate(10, 17.917); // 11 * 1.628 = 17.9

// Verify Reward Logic Mock
// Logic: isTierClear = (matchIndex + 1) === 3
console.log("\nChecking Reward Trigger Condition:");
const checkReward = (matchIdx) => {
    const isTierClear = (matchIdx + 1) === 3;
    console.log(`Match Index ${matchIdx} (Display ${matchIdx+1}/3): Tier Clear? ${isTierClear}`);
    return isTierClear;
};

if (!checkReward(0)) console.log("PASS: Match 0 (1/3) no reward.");
if (!checkReward(1)) console.log("PASS: Match 1 (2/3) no reward.");
if (checkReward(2)) console.log("PASS: Match 2 (3/3) REWARD!");
else console.error("FAIL: Match 2 should trigger reward.");

console.log("=== Verification Complete ===");
