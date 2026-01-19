
const ASSESSMENT_CONFIG = {
    hugeDisadvantage: {
        texts: ["Hopeless", "Blunder Prone", "Suicidal"],
        color: "text-red-600"
    },
    disadvantage: {
        texts: ["Dubious", "Under Pressure", "Cramped"],
        color: "text-orange-500"
    },
    even: {
        texts: ["Equal", "Sharp", "Drawish"],
        color: "text-gray-300"
    },
    advantage: {
        texts: ["Comfortable", "Promising", "Active"],
        color: "text-green-400"
    },
    hugeAdvantage: {
        texts: ["Winning", "Dominant", "Crushing"],
        color: "text-emerald-400"
    }
};

const getAssessment = (playerStat, enemyStat) => {
    if (!enemyStat || enemyStat === 0) {
        // Fallback for 0 stat (avoid division by zero), treat as Even/Equal
        const texts = ASSESSMENT_CONFIG.even.texts;
        return {
            text: texts[Math.floor(Math.random() * texts.length)],
            colorClass: ASSESSMENT_CONFIG.even.color,
            category: 'even' // Added for test verification
        };
    }

    const ratio = playerStat / enemyStat;
    let config;
    let category;

    if (ratio < 0.5) {
        config = ASSESSMENT_CONFIG.hugeDisadvantage;
        category = 'hugeDisadvantage';
    } else if (ratio <= 0.9) {
        config = ASSESSMENT_CONFIG.disadvantage;
        category = 'disadvantage';
    } else if (ratio <= 1.1) {
        config = ASSESSMENT_CONFIG.even;
        category = 'even';
    } else if (ratio <= 1.5) {
        config = ASSESSMENT_CONFIG.advantage;
        category = 'advantage';
    } else {
        config = ASSESSMENT_CONFIG.hugeAdvantage;
        category = 'hugeAdvantage';
    }

    return {
        text: config.texts[Math.floor(Math.random() * config.texts.length)],
        colorClass: config.color,
        category: category
    };
};

// Test Cases
const testCases = [
    { p: 40, e: 100, ratio: 0.4, expected: 'hugeDisadvantage' },
    { p: 49, e: 100, ratio: 0.49, expected: 'hugeDisadvantage' },
    { p: 50, e: 100, ratio: 0.5, expected: 'disadvantage' },
    { p: 89, e: 100, ratio: 0.89, expected: 'disadvantage' },
    { p: 90, e: 100, ratio: 0.9, expected: 'disadvantage' },
    { p: 91, e: 100, ratio: 0.91, expected: 'even' },
    { p: 100, e: 100, ratio: 1.0, expected: 'even' },
    { p: 110, e: 100, ratio: 1.1, expected: 'even' },
    { p: 111, e: 100, ratio: 1.11, expected: 'advantage' },
    { p: 150, e: 100, ratio: 1.5, expected: 'advantage' },
    { p: 151, e: 100, ratio: 1.51, expected: 'hugeAdvantage' },
    { p: 100, e: 0, ratio: Infinity, expected: 'even' }, // Handle 0
];

let failed = false;

console.log("Running Assessment Logic Verification...");

testCases.forEach(({ p, e, expected }) => {
    const result = getAssessment(p, e);
    const validTexts = ASSESSMENT_CONFIG[result.category].texts;

    // Determine category based on color (since category string isn't in production code, but I added it to test helper)
    // Actually I added it to test helper return object above.

    const passed = result.category === expected;
    const textValid = validTexts.includes(result.text);

    console.log(`P: ${p}, E: ${e} -> Category: ${result.category} (Expected: ${expected}) | Text: "${result.text}" [${passed && textValid ? 'PASS' : 'FAIL'}]`);

    if (!passed || !textValid) failed = true;
});

if (failed) {
    console.error("\nSOME TESTS FAILED");
    process.exit(1);
} else {
    console.log("\nALL TESTS PASSED");
    process.exit(0);
}
