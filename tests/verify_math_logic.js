import { calculateCostBreakdown } from '../src/logic/math.js';

// Mock Stats
const emptyStats = {
    opening: 0, midgame: 0, endgame: 0,
    tactics: 0, defense: 0, sacrifices: 0
};

const statsScenario1 = {
    opening: 0, midgame: 100, endgame: 0,
    tactics: 0, defense: 0, sacrifices: 0
};

const statsScenario2 = {
    opening: 501, midgame: 100, endgame: 0,
    tactics: 0, defense: 0, sacrifices: 0
};

const statsScenario3 = {
    opening: 0, midgame: 0, endgame: 0,
    tactics: 0, defense: 50, sacrifices: 0
};

const statsScenarioCap = {
    opening: 0, midgame: 10000, endgame: 10000, // Massive foreign levels
    tactics: 0, defense: 0, sacrifices: 0
};

console.log("=== VERIFY MATH LOGIC ===");

// TEST 1: Sacrifice Cost (No Tax)
const sacCost = calculateCostBreakdown(0, statsScenario1, 'sacrifices');
const expectedSacBase = 1.0; // 1.10^(1-1) = 1
console.log(`Test 1 (Sacrifice): Multiplier should be 1.0. Actual: ${sacCost.multiplier}`);
if (sacCost.multiplier !== 1.0) throw new Error("Sacrifice should not have tax");

// TEST 2: Opening (Tier 1) - Isolated
const opCostIso = calculateCostBreakdown(0, emptyStats, 'opening');
console.log(`Test 2 (Opening Isolated): Multiplier should be 1.0. Actual: ${opCostIso.multiplier}`);
if (opCostIso.multiplier !== 1.0) throw new Error("Isolated skill should not have tax");

// TEST 3: Opening (Tier 1) - Taxed by Midgame
const opCostTaxed = calculateCostBreakdown(0, statsScenario1, 'opening');
const expectedTax3 = Math.pow(1.015, 100);
console.log(`Test 3 (Opening Taxed Tier 1): Expected Mult: ${expectedTax3.toPrecision(5)}, Actual: ${opCostTaxed.multiplier.toPrecision(5)}`);
if (Math.abs(opCostTaxed.multiplier - expectedTax3) > 0.0001) throw new Error("Incorrect Tax for Tier 1");
if (opCostTaxed.foreignLevels !== 100) throw new Error("Incorrect Foreign Levels");

// TEST 4: Opening (Tier 2) - Taxed by Midgame
// Note: Tax rate changes to 1.04 for Tier 2 (Level > 500)
const opCostTier2 = calculateCostBreakdown(501, statsScenario2, 'opening');
const expectedTax4 = Math.pow(1.04, 100);
console.log(`Test 4 (Opening Taxed Tier 2): Expected Mult: ${expectedTax4.toPrecision(5)}, Actual: ${opCostTier2.multiplier.toPrecision(5)}`);
if (Math.abs(opCostTier2.multiplier - expectedTax4) > 0.0001) throw new Error("Incorrect Tax for Tier 2");

// TEST 5: Tactics (Tier 1) - Taxed by Defense
const tacCost = calculateCostBreakdown(0, statsScenario3, 'tactics');
const expectedTax5 = Math.pow(1.015, 50);
console.log(`Test 5 (Tactics Taxed): Expected Mult: ${expectedTax5.toPrecision(5)}, Actual: ${tacCost.multiplier.toPrecision(5)}`);
if (Math.abs(tacCost.multiplier - expectedTax5) > 0.0001) throw new Error("Incorrect Tax for Instinct Group");

// TEST 6: Cap
const capCost = calculateCostBreakdown(0, statsScenarioCap, 'opening');
console.log(`Test 6 (Cap): Multiplier should be 1e50. Actual: ${capCost.multiplier}`);
if (capCost.multiplier !== 1e50) throw new Error("Multiplier not capped at 1e50");

console.log("ALL TESTS PASSED");
