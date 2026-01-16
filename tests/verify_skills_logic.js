import { SKILLS, getSkillById } from '../src/logic/skills.js';
import { calculateMove, applyModeWeights } from '../src/logic/simulation.js';

console.log("--- Verifying Skills Data ---");
const studySkills = SKILLS.filter(s => s.group === 'study_path');
if (studySkills.length !== 3) console.error("FAIL: Expected 3 study_path skills");
else console.log("PASS: Found 3 study_path skills");

const instinctSkills = SKILLS.filter(s => s.group === 'instinct_path');
if (instinctSkills.length !== 3) console.error("FAIL: Expected 3 instinct_path skills");
else console.log("PASS: Found 3 instinct_path skills");

const chaos = getSkillById('chaos_theory');
if (!chaos || chaos.costType !== 'AP' || chaos.cost !== 2) console.error("FAIL: Chaos Theory incorrect cost or missing");
else console.log("PASS: Chaos Theory correctly configured");


console.log("\n--- Verifying Simulation Logic ---");

const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
const rawEnemy = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };

// Test 1: No Skills
let res = calculateMove(1, rawPlayer, rawEnemy, 0, {}, false, 0, 'rapid', 0);
let baseOpening = res.effectivePlayerStats.opening;
console.log(`Base Opening (No Skill): ${baseOpening}`);

// Test 2: Study Opening
res = calculateMove(1, rawPlayer, rawEnemy, 0, { study_opening: true }, false, 0, 'rapid', 0);
let buffedOpening = res.effectivePlayerStats.opening;
console.log(`Buffed Opening (Skill): ${buffedOpening}`);

if (Math.abs(buffedOpening - baseOpening * 1.1) < 0.01) {
    console.log("PASS: Opening Stat buff applied (x1.1)");
} else {
    console.error(`FAIL: Opening Stat buff mismatch. Expected ${baseOpening * 1.1}, got ${buffedOpening}`);
}

// Test 3: Instinct Tactics
// Note: calculateMove calls applyModeWeights. For rapid, weights are 1.0.
res = calculateMove(1, rawPlayer, rawEnemy, 0, { instinct_tactics: true }, false, 0, 'rapid', 0);
let buffedTactics = res.effectivePlayerStats.tactics;
// Base tactics is 100.
if (Math.abs(buffedTactics - 110) < 0.01) {
    console.log("PASS: Tactics Stat buff applied (x1.1)");
} else {
    console.error(`FAIL: Tactics Stat buff mismatch. Expected 110, got ${buffedTactics}`);
}

// Test 4: Instinct Defense
res = calculateMove(1, rawPlayer, rawEnemy, 0, { instinct_defense: true }, false, 0, 'rapid', 0);
let buffedDefense = res.effectivePlayerStats.defense;
// Base defense is 100.
if (Math.abs(buffedDefense - 110) < 0.01) {
    console.log("PASS: Defense Stat buff applied (x1.1)");
} else {
    console.error(`FAIL: Defense Stat buff mismatch. Expected 110, got ${buffedDefense}`);
}

console.log("\n--- Verification Complete ---");
