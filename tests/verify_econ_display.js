import { calculatePassiveIncomePerMinute } from '../src/logic/math.js';

console.log("Running Economy Verification Test...");

const testCases = [
    { wins: 0, tiers: 0, expected: 1.0 },
    { wins: 0, tiers: 10, expected: 1.104622 }, // 1 * 1.01^10
    { wins: 5, tiers: 10, expected: 6.62773 },  // 6 * 1.01^10
    { wins: 0, tiers: 100, expected: 2.70481 }, // 1.01^100
];

let failed = false;

testCases.forEach((test, index) => {
    const result = calculatePassiveIncomePerMinute(test.wins, test.tiers);
    const diff = Math.abs(result - test.expected);

    if (diff > 0.0001) {
        console.error(`FAILED Case ${index}: Wins ${test.wins}, Tiers ${test.tiers}. Expected ${test.expected}, Got ${result}`);
        failed = true;
    } else {
        console.log(`PASSED Case ${index}: Wins ${test.wins}, Tiers ${test.tiers}. Result: ${result.toFixed(5)}`);
    }
});

if (failed) {
    console.error("Economy Verification FAILED.");
    process.exit(1);
} else {
    console.log("Economy Verification PASSED.");
}
