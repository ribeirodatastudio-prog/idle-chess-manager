import { calculateTenureMultiplier, calculateBranchSP, SKILLS } from '../src/logic/skills.js';
import { calculateMove } from '../src/logic/simulation.js';

console.log("--- Update Audit Verification ---");

// 1. Verify Branch SP Calculation
console.log("\n1. Branch SP Calculation:");

// Mock skills
const mockSkills1 = {
    'instinct_tactics': true, // Root (1 SP)
    'inst_tac_op': 2 // Tier 2 (1 SP each) -> 2 SP
};
// Total = 1 + 2 = 3 SP.

const sp1 = calculateBranchSP(mockSkills1, 'instinct_tactics');
console.log(`Test 1 (Tac Root + Tac Op Lvl 2): ${sp1} (Expected: 3)`);
if (sp1 !== 3) console.error("FAIL: Branch SP calculation wrong.");

const mockSkills2 = {
    'instinct_tactics': true, // 1 SP
    'inst_tac_op': 5, // 5 SP
    'inst_tac_deb': 3, // 5 SP each -> 15 SP
    'inst_tac_scale': 1 // 10 SP each -> 10 SP
};
// Total = 1 + 5 + 15 + 10 = 31 SP.
const sp2 = calculateBranchSP(mockSkills2, 'instinct_tactics');
console.log(`Test 2 (Complex Branch): ${sp2} (Expected: 31)`);
if (sp2 !== 31) console.error("FAIL: Complex Branch SP calculation wrong.");


// 2. Verify Tenure Multiplier
console.log("\n2. Tenure Multiplier:");

// Case A: No Tenure skills
const skillsA = { 'op_def_master': 5, 'mid_def_master': 5 }; // 10 levels
// Multiplier should be 1.0 because Tenure skills not owned.
const tenA = calculateTenureMultiplier(skillsA);
console.log(`Case A (No Tenure): ${tenA} (Expected: 1.0)`);

// Case B: Tenure Lvl 1 in Opening
const skillsB = {
    'op_def_master': 10,
    'op_tenure': 1,
    'mid_def_master': 5
};
// Opening Levels: 10 + 1 (Tenure itself is in Opening Tree and counts as level? Let's check logic)
// Logic: "sumLevels" checks "isDescendant('study_opening')".
// 'op_tenure' parentId is 'study_opening'. So yes, it counts.
// Levels = 10 (def) + 1 (tenure) = 11.
// Mult = 1.05 ^ (11 * 1) = 1.7103
const tenB = calculateTenureMultiplier(skillsB);
console.log(`Case B (Tenure Lvl 1 Op, 11 Levels): ${tenB.toFixed(4)} (Expected: ${Math.pow(1.05, 11).toFixed(4)})`);

// Case C: Tenure Lvl 2 in Opening
const skillsC = {
    'op_def_master': 10,
    'op_tenure': 2
};
// Levels = 12.
// Mult = 1.05 ^ (12 * 2) = 1.05 ^ 24 = 3.225
const tenC = calculateTenureMultiplier(skillsC);
console.log(`Case C (Tenure Lvl 2 Op, 12 Levels): ${tenC.toFixed(4)} (Expected: ${Math.pow(1.05, 24).toFixed(4)})`);


// 3. Verify Instinct Multiplier Logic (Simulation)
console.log("\n3. Instinct Economy Multiplier (Logic Check):");
const tacEconLvl = 2; // +2% per SP
const tacSP = 31; // From earlier test
const mult = 1 + (0.01 * tacEconLvl * tacSP); // 1 + 0.02 * 31 = 1 + 0.62 = 1.62
console.log(`Instinct Mult (Lvl 2, 31 SP): ${mult.toFixed(2)} (Expected: 1.62)`);


// 4. Verify Simulation Debuffs & Scaling
console.log("\n4. Simulation Logic:");

const playerStats = { opening: 100, tactics: 100, defense: 100, midgame: 100, endgame: 100, sacrifices: 100 };
const enemyStats = { opening: 100, tactics: 100, defense: 100, midgame: 100, endgame: 100, sacrifices: 100 };

// Test Debuff: Blunt Edge (Enemy Tac -1%/lvl)
const skillsDebuff = { 'inst_tac_deb': 10 }; // -10% Enemy Tactics
const resDebuff = calculateMove(15, playerStats, enemyStats, 0, skillsDebuff);
// Access effectiveEnemyStats from result
const effEnemyTac = resDebuff.effectiveEnemyStats.tactics;
// Base 100. -10% -> 90.
console.log(`Debuff (Enemy Tactics): ${effEnemyTac.toFixed(2)} (Expected: 90.00)`);

// Test Scaling: Battle Flow (Player Tac x1.005^Move)
const skillsScale = { 'inst_tac_scale': 2 }; // Base 1 + 0.01 = 1.01.
const moveNum = 50;
const resScale = calculateMove(moveNum, playerStats, enemyStats, 0, skillsScale);
const effPlayerTac = resScale.effectivePlayerStats.tactics;
// Base 100 * (1.01 ^ 50). 1.01^50 = 1.6446. Result ~164.46
const expectedTac = 100 * Math.pow(1.01, 50);
console.log(`Scaling (Player Tactics): ${effPlayerTac.toFixed(2)} (Expected: ${expectedTac.toFixed(2)})`);

console.log("\nVerification Complete.");
