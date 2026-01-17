import { calculateTenureMultiplier, calculateInstinctMultiplier, SKILLS } from '../src/logic/skills.js';

console.log("Starting Economy Nerf Verification...");

// Mock Skills
// We need to simulate having levels in a branch to test Tenure.
// 'op_def_master' is in 'study_opening' branch.
const mockSkillsTenure = {
    'study_opening': true, // Root
    'op_def_master': 10,   // 10 Levels in Opening Defense
    'op_tenure': 1         // Tenure Owned
};

// 1. Verify Tenure Math
console.log("\nTesting Tenure Math:");
const tenureMult = calculateTenureMultiplier(mockSkillsTenure);
// Expected: 1.05 ^ (10 levels)
// Note: 'op_def_master' is 10. 'study_opening' is root (0 or 1? logic says 'levels += getLevel').
// SKILLS has 'study_opening' as tier 0. getLevel returns 1 if true.
// So total levels = 1 (root) + 10 (def) + 1 (tenure itself? tenure is in the branch!)
// Let's check logic:
// SKILLS.forEach(skill => if (id === rootId || isDescendant(skill.id, rootId)) levels += getLevel)
// 'op_tenure' parent is 'study_opening'. So it counts.
// Total levels = 1 (root) + 10 (def) + 1 (tenure) = 12.
// Wait, 'study_opening' is root. 'op_def_master' is child. 'op_tenure' is child.
// So yes, 12 levels.
const expectedTenure = Math.pow(1.05, 12);
console.log(`Levels: 12 (1 root + 10 def + 1 tenure)`);
console.log(`Calculated Tenure Mult: ${tenureMult}`);
console.log(`Expected Tenure Mult:   ${expectedTenure}`);

if (Math.abs(tenureMult - expectedTenure) < 0.0001) {
    console.log("PASS: Tenure Math correct.");
} else {
    console.error("FAIL: Tenure Math incorrect.");
    process.exit(1);
}

// 2. Verify Tenure is a Perk (Level doesn't multiply exponent)
console.log("\nTesting Tenure Level Independence:");
const mockSkillsTenureHigh = {
    ...mockSkillsTenure,
    'op_tenure': 5 // Hacked to level 5
};
// Total levels = 1 + 10 + 5 = 16.
// If it was old logic: 1.05 ^ (16 * 5) = HUGE
// New logic: 1.05 ^ 16
const tenureMultHigh = calculateTenureMultiplier(mockSkillsTenureHigh);
const expectedTenureHigh = Math.pow(1.05, 16);
console.log(`Levels: 16. Tenure Level: 5.`);
console.log(`Calculated: ${tenureMultHigh}`);
console.log(`Expected (Perk): ${expectedTenureHigh}`);

if (Math.abs(tenureMultHigh - expectedTenureHigh) < 0.0001) {
    console.log("PASS: Tenure behaves as a Perk (ignores skill level multiplier).");
} else {
    console.error("FAIL: Tenure is still scaling with skill level!");
    process.exit(1);
}

// 3. Verify Instinct Hustle Math
console.log("\nTesting Instinct Hustle Math:");
// 'instinct_tactics' is root. 'inst_tac_op' is child.
// 'inst_tac_econ' is the hustle skill.
// Cost check:
// instinct_tactics: 1 SP
// inst_tac_op: 1 SP (lvl 1)
// inst_tac_econ: 5 SP (lvl 1)
// Total SP = 1 + 1 + 5 = 7.
const mockSkillsInstinct = {
    'instinct_tactics': true,
    'inst_tac_op': 1,
    'inst_tac_econ': 1
};
const instinctMult = calculateInstinctMultiplier(mockSkillsInstinct);
// Expected: 1 + (0.01 * 7) = 1.07
console.log(`Total SP: 7`);
console.log(`Calculated Instinct Mult: ${instinctMult}`);
console.log(`Expected Instinct Mult:   1.07`);

if (Math.abs(instinctMult - 1.07) < 0.0001) {
    console.log("PASS: Instinct Hustle Math correct.");
} else {
    console.error("FAIL: Instinct Hustle Math incorrect.");
    process.exit(1);
}

// 4. Verify Instinct Hustle is a Perk
console.log("\nTesting Instinct Hustle Level Independence:");
const mockSkillsInstinctHigh = {
    'instinct_tactics': true, // 1 SP
    'inst_tac_op': 1,         // 1 SP
    'inst_tac_econ': 5        // 5 * 5 = 25 SP (Wait, calculateBranchSP uses level * cost)
};
// SP Calc:
// Root: 1 * 1 = 1
// Tac Op: 1 * 1 = 1
// Tac Econ: 5 * 5 = 25
// Total SP = 27.
// Logic: 1 + (0.01 * 27) = 1.27.
// If it was old logic: 1 + (0.01 * 5 * 27) = 2.35.

const instinctMultHigh = calculateInstinctMultiplier(mockSkillsInstinctHigh);
const expectedInstinctHigh = 1.27;

console.log(`Total SP: 27. Hustle Level: 5.`);
console.log(`Calculated: ${instinctMultHigh}`);
console.log(`Expected (Perk): ${expectedInstinctHigh}`);

if (Math.abs(instinctMultHigh - expectedInstinctHigh) < 0.0001) {
    console.log("PASS: Instinct Hustle behaves as a Perk.");
} else {
    console.error("FAIL: Instinct Hustle is still scaling with skill level!");
    process.exit(1);
}

console.log("\nAll checks passed!");
