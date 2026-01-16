
const SKILLS = [
  {
    id: 'op_def_master',
    name: 'Opening Defense',
    maxLevel: 5,
    costType: 'SP',
    spCost: 1
  },
  {
    id: 'single_purchase_skill',
    name: 'Single Purchase',
    maxLevel: 1, // Default
    costType: 'AP',
    cost: 1
  }
];

const getSkillById = (id) => SKILLS.find(s => s.id === id);

// Mock State
let currentSkills = {
    'op_def_master': 1 // Already bought level 1
};

// This function mimics the corrected logic in useGameState.js
function purchaseSkill(skillId) {
    const skill = getSkillById(skillId);

    // Corrected check: Only check if skill exists
    if (!skill) return { success: false, reason: "Skill not found" };

    // Handle Leveling Logic
    const currentLevel = typeof currentSkills[skillId] === 'number'
        ? currentSkills[skillId]
        : (currentSkills[skillId] ? 1 : 0);

    const maxLevel = skill.maxLevel || 1;

    if (currentLevel >= maxLevel) {
        return { success: false, reason: "Max level reached" };
    }

    // Logic continues...
    return { success: true };
}

console.log("--- Verifying Skill Purchase Logic ---");

let failures = 0;

// Test 1: Purchase Level 2 of a multi-level skill
console.log("Test 1: Purchase Level 2 of multi-level skill...");
let result = purchaseSkill('op_def_master');
if (result.success) {
    console.log("PASS: Allowed purchasing level 2.");
} else {
    console.error(`FAIL: Blocked purchasing level 2. Reason: ${result.reason}`);
    failures++;
}

// Test 2: Purchase single-level skill that is not owned
console.log("Test 2: Purchase new single-level skill...");
result = purchaseSkill('single_purchase_skill');
if (result.success) {
    console.log("PASS: Allowed purchasing new skill.");
} else {
    console.error(`FAIL: Blocked purchasing new skill. Reason: ${result.reason}`);
    failures++;
}

// Test 3: Purchase single-level skill that is already owned
console.log("Test 3: Purchase owned single-level skill...");
currentSkills['single_purchase_skill'] = true; // Simulate ownership
result = purchaseSkill('single_purchase_skill');
if (!result.success && result.reason === "Max level reached") {
    console.log("PASS: Correctly blocked purchasing owned single-level skill.");
} else {
    console.error(`FAIL: Should have blocked with 'Max level reached'. Result: ${JSON.stringify(result)}`);
    failures++;
}

// Test 4: Purchase maxed multi-level skill
console.log("Test 4: Purchase maxed multi-level skill...");
currentSkills['op_def_master'] = 5; // Simulate max level
result = purchaseSkill('op_def_master');
if (!result.success && result.reason === "Max level reached") {
    console.log("PASS: Correctly blocked purchasing maxed multi-level skill.");
} else {
    console.error(`FAIL: Should have blocked with 'Max level reached'. Result: ${JSON.stringify(result)}`);
    failures++;
}

if (failures > 0) {
    console.error(`\n${failures} tests failed.`);
    process.exit(1);
} else {
    console.log("\nAll tests passed.");
    process.exit(0);
}
