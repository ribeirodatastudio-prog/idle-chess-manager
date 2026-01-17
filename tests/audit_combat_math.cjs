const { calculateMove, getPhaseConfig, PHASES } = require('../src/logic/simulation.js');
const { SKILLS, getSkillById, calculateTenureMultiplier, calculateBranchSP } = require('../src/logic/skills.js');

console.log("=== QA COMBAT MATH AUDIT ===");

const runTest = (name, fn) => {
    console.log(`\n--- ${name} ---`);
    try {
        fn();
    } catch (e) {
        console.error(`ERROR in ${name}:`, e);
    }
};

// --- SECTION 1: PHASE LOGIC ---
runTest("Phase Logic Verification", () => {
    // 1. Default
    let config = getPhaseConfig({});
    console.log(`Default Phase Config: OpEnd=${config.openingEnd} (Exp: 10), MidEnd=${config.midgameEnd} (Exp: 30)`);

    // 2. Extenders
    config = getPhaseConfig({ op_extender: 3, mid_extender: 3 });
    console.log(`Extended Phase Config: OpEnd=${config.openingEnd} (Exp: 13), MidEnd=${config.midgameEnd} (Exp: 36)`);

    // Simulate boundaries
    const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
    const rawEnemy = { ...rawPlayer };

    // Default
    let res = calculateMove(11, rawPlayer, rawEnemy, 0, {}, false, 0);
    console.log(`Turn 11 Phase (Default): ${res.phase} (Expected: Midgame)`);

    // With Extender
    // NOTE: calculateMove requires phaseConfig to be passed explicitly!
    const extConfig = getPhaseConfig({ op_extender: 3 });
    res = calculateMove(11, rawPlayer, rawEnemy, 0, { op_extender: 3 }, false, 0, 'rapid', 0, extConfig);
    console.log(`Turn 11 Phase (Op Extender Lvl 3): ${res.phase} (Expected: Opening)`);

    res = calculateMove(14, rawPlayer, rawEnemy, 0, { op_extender: 3 }, false, 0, 'rapid', 0, extConfig);
    console.log(`Turn 14 Phase (Op Extender Lvl 3): ${res.phase} (Expected: Midgame)`);
});

// --- SECTION 2: MOMENTUM (op_space) ---
runTest("Momentum Verification (op_space)", () => {
    const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
    const rawEnemy = { ...rawPlayer };

    // Turn 11 (Midgame start)
    // Case A: No buff
    let res = calculateMove(11, rawPlayer, rawEnemy, 0, {}, false, 0);
    console.log(`Base Midgame Stat (No Skill): ${res.effectivePlayerStats.midgame}`); // Should be 100

    // Case B: Skill but Phase 1 Lost
    res = calculateMove(11, rawPlayer, rawEnemy, 0, { op_space: 1 }, false, 0);
    console.log(`Midgame Stat (Skill, P1 Lost): ${res.effectivePlayerStats.midgame} (Expected: 100)`);

    // Case C: Skill and Phase 1 Won
    res = calculateMove(11, rawPlayer, rawEnemy, 0, { op_space: 1 }, true, 0); // phase1Won = true
    console.log(`Midgame Stat (Skill, P1 Won): ${res.effectivePlayerStats.midgame} (Expected: 104)`);

    // Check All Stats
    console.log(`Midgame Tactics (Skill, P1 Won): ${res.effectivePlayerStats.tactics} (Expected: 104)`);
});

// --- SECTION 3: SCALING (inst_tac_scale) ---
runTest("Scaling Verification (inst_tac_scale)", () => {
    const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
    const rawEnemy = { ...rawPlayer };

    // Formula: base * (1 + 0.005 * Lvl) ^ Turn
    // Lvl 1 => 1.005 ^ Turn

    // Turn 1
    let res = calculateMove(1, rawPlayer, rawEnemy, 0, { inst_tac_scale: 1 }, false, 0);
    console.log(`Turn 1 Tactics (Scale Lvl 1): ${res.effectivePlayerStats.tactics.toFixed(4)} (Expected: ${(100 * Math.pow(1.005, 1)).toFixed(4)})`);

    // Turn 10
    res = calculateMove(10, rawPlayer, rawEnemy, 0, { inst_tac_scale: 1 }, false, 0);
    console.log(`Turn 10 Tactics (Scale Lvl 1): ${res.effectivePlayerStats.tactics.toFixed(4)} (Expected: ${(100 * Math.pow(1.005, 10)).toFixed(4)})`);

    // Turn 20
    res = calculateMove(20, rawPlayer, rawEnemy, 0, { inst_tac_scale: 1 }, false, 0);
    console.log(`Turn 20 Tactics (Scale Lvl 1): ${res.effectivePlayerStats.tactics.toFixed(4)} (Expected: ${(100 * Math.pow(1.005, 20)).toFixed(4)})`);
});

// --- SECTION 4: DEBUFFS ---
runTest("Debuff Verification", () => {
    const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
    const rawEnemy = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };

    // op_novelty: Enemy Opening -3%/lvl
    let res = calculateMove(1, rawPlayer, rawEnemy, 0, { op_novelty: 1 }, false, 0);
    console.log(`Enemy Opening (Novelty Lvl 1): ${res.effectiveEnemyStats.opening} (Expected: 97)`);

    // mid_cloud: Enemy Tactics -3%/lvl (Midgame)
    res = calculateMove(11, rawPlayer, rawEnemy, 0, { mid_cloud: 1 }, false, 0);
    console.log(`Enemy Tactics (Cloud Lvl 1): ${res.effectiveEnemyStats.tactics} (Expected: 97)`);
});

// --- SECTION 5: STACKING LOGIC ---
runTest("Stacking Logic Analysis", () => {
    const rawPlayer = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };
    const rawEnemy = { ...rawPlayer };

    // Combine:
    // 1. study_opening (x1.1) -> Multiplicative
    // 2. op_def_master (1 + 0.1/lvl) -> Additive to base? Or multiplicative?
    // Let's test op_def_master alone first
    let res = calculateMove(1, rawPlayer, rawEnemy, 0, { op_def_master: 1 }, false, 0);
    console.log(`Defense (Master Lvl 1): ${res.effectivePlayerStats.defense} (Expected: 110)`);

    // Now Combine op_def_master (Lvl 1 -> 1.1) + instinct_defense (x1.1)
    res = calculateMove(1, rawPlayer, rawEnemy, 0, { op_def_master: 1, instinct_defense: true }, false, 0);
    console.log(`Defense (Master Lvl 1 + Instinct): ${res.effectivePlayerStats.defense} (Expected: 100 * 1.1 * 1.1 = 121)`);

    // Add Scaling (Turn 10, Lvl 1 -> 1.005^10 = 1.0511)
    // Skill: inst_def_scale
    const scaleMult = Math.pow(1.005, 10);
    res = calculateMove(10, rawPlayer, rawEnemy, 0, { op_def_master: 1, instinct_defense: true, inst_def_scale: 1 }, false, 0);
    console.log(`Defense (Master + Instinct + Scale): ${res.effectivePlayerStats.defense.toFixed(4)} (Expected: ${(100 * 1.1 * 1.1 * scaleMult).toFixed(4)})`);
});

// --- SECTION 6: ECONOMY AUDIT ---
runTest("Economy Audit", () => {
    // 1. Tenure
    // Logic: 1.05 ^ (Sum Levels in Branch * Tenure Level)

    const mockSkillsTenure = {
        study_opening: true, // Level 1 (Tier 0)
        op_def_master: 5,    // Tier 1
        op_tenure: 1         // The tenure skill itself (Level 1)
    };
    // Branch Levels = 1 (Root) + 5 (Master) + 1 (Tenure) = 7
    // Multiplier = 1.05 ^ (7 * 1) = 1.407

    const tenureMult = calculateTenureMultiplier(mockSkillsTenure);
    console.log(`Tenure Multiplier (7 levels, Lvl 1 Tenure): ${tenureMult.toFixed(4)} (Expected: ${Math.pow(1.05, 7).toFixed(4)})`);

    // 2. Instinct Hustle
    // Logic copied from useGameState.js
    const calculateInstinctMultiplier = (skills) => {
        const getLevel = (s, id) => s[id] || 0;

        const tacEcon = getLevel(skills, 'inst_tac_econ');
        const defEcon = getLevel(skills, 'inst_def_econ');
        const riskEcon = getLevel(skills, 'inst_risk_econ');

        let instinctMult = 1.0;
        if (tacEcon > 0) {
            const sp = calculateBranchSP(skills, 'instinct_tactics');
            instinctMult *= (1 + (0.01 * tacEcon * sp));
        }
        if (defEcon > 0) {
            const sp = calculateBranchSP(skills, 'instinct_defense');
            instinctMult *= (1 + (0.01 * defEcon * sp));
        }
        if (riskEcon > 0) {
            const sp = calculateBranchSP(skills, 'instinct_risk');
            instinctMult *= (1 + (0.01 * riskEcon * sp));
        }
        return instinctMult;
    };

    // Test Case:
    // inst_tac_econ Level 1
    // Spent SP in Tactics Branch:
    // Root (instinct_tactics): 1 SP
    // inst_tac_op (Lvl 5): 5 SP
    // inst_tac_econ (Lvl 1): 5 SP
    // Total SP = 11
    // Expected Mult = 1 + (0.01 * 1 * 11) = 1.11

    const mockSkillsHustle = {
        instinct_tactics: true,
        inst_tac_op: 5,
        inst_tac_econ: 1
    };

    const hustleMult = calculateInstinctMultiplier(mockSkillsHustle);
    console.log(`Hustle Multiplier (11 SP, Lvl 1 Econ): ${hustleMult.toFixed(4)} (Expected: 1.1100)`);
});
