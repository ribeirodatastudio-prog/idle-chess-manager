
import { getSnapshot, PHASES, applyModeWeights } from '../src/logic/simulation.js';
import { SKILLS } from '../src/logic/skills.js';

// Mock Phase Config
const mockPhaseConfig = {
    openingEnd: 10,
    midgameEnd: 30,
    maxTurns: 50
};

// Mock Stats
const baseStats = {
    opening: 100,
    midgame: 100,
    endgame: 100,
    tactics: 100,
    sacrifices: 100,
    defense: 100
};

function runAudit() {
    console.log("=== STARTING MATH AUDIT ===");
    let errors = [];

    // --- TEST 1: Base Stats (Rapid) ---
    // Should be exactly base stats.
    try {
        const snap = getSnapshot(1, baseStats, baseStats, {}, mockPhaseConfig, { phase1Won: false, phase2Won: false });
        if (snap.playerStats.opening !== 100) errors.push(`T1 Base Opening mismatch. Got ${snap.playerStats.opening}, expected 100.`);
        console.log("Test 1 (Base): Pass");
        if (snap.debugBreakdown) console.log("DEBUG LOG T1:", snap.debugBreakdown);
    } catch (e) {
        errors.push("Test 1 Failed with error: " + e.message);
    }

    // --- TEST 2: Stacking Logic ---
    // Additive: Instinct (+1%) + Momentum (+4%) = 1.05
    // Multiplicative: Phase Mastery (+10% -> 1.1) * Study Focus (1.1) = 1.21
    // Total Mult: 1.05 * 1.21 = 1.2705
    // Base 100 -> 127.05

    // Skills to mock:
    // inst_tac_op (Lvl 1) -> +1% Additive (Tactics, Opening Phase)
    // op_space (Lvl 1) -> +4% Additive (All Stats, Midgame Phase, if Phase 1 Won)
    // op_tac_master (Lvl 1) -> +10% Multiplicative (Tactics, Opening Phase)
    // study_opening (True) -> x1.1 Multiplicative (All Opening Stats)

    // Let's test Opening Phase first (Turn 5)
    // Active: inst_tac_op (+1%), op_tac_master (*1.1), study_opening (*1.1)
    // Expected Tactics:
    // - Additive: inst_tac_op (+1%) -> 1.01
    // - Multiplicative: op_tac_master (*1.1)
    // - study_opening (*1.1) -> ONLY applies to 'opening' stat, not 'tactics'.
    // Result: 100 * 1.01 * 1.1 = 111.1

    const stackSkills = {
        inst_tac_op: 1,
        op_tac_master: 1,
        study_opening: true
    };

    try {
        const snap = getSnapshot(5, baseStats, baseStats, stackSkills, mockPhaseConfig, { phase1Won: true });
        // Tolerance for float math
        const expected = 100 * 1.01 * 1.1;
        if (Math.abs(snap.playerStats.tactics - expected) > 0.001) {
            errors.push(`T2 Stacking Opening mismatch. Got ${snap.playerStats.tactics}, expected ${expected}`);
        } else {
            console.log("Test 2A (Opening Stacking - Tactics): Pass");
        }

        // Verify study_opening on Opening Stat
        // Opening: 100 * 1.1 = 110
        if (Math.abs(snap.playerStats.opening - 110) > 0.001) {
             errors.push(`T2 Stacking Opening mismatch (Opening Stat). Got ${snap.playerStats.opening}, expected 110`);
        } else {
             console.log("Test 2A (Opening Stacking - Opening): Pass");
        }

    } catch (e) {
        errors.push("Test 2A Failed: " + e.message);
    }

    // Test Midgame Momentum (Turn 15)
    // Active: op_space (Lvl 1) -> +4% Additive (Midgame) if Phase 1 Won
    // Let's add inst_tac_mid (Lvl 1) -> +1% Additive
    // Expected: 100 * (1 + 0.04 + 0.01) = 105
    const momentumSkills = {
        op_space: 1,
        inst_tac_mid: 1
    };

    try {
        const snap = getSnapshot(15, baseStats, baseStats, momentumSkills, mockPhaseConfig, { phase1Won: true });
        const expected = 100 * 1.05;
        if (Math.abs(snap.playerStats.tactics - expected) > 0.001) {
            errors.push(`T2 Stacking Midgame Momentum mismatch. Got ${snap.playerStats.tactics}, expected ${expected}`);
        } else {
            console.log("Test 2B (Momentum Stacking): Pass");
        }
    } catch (e) {
        errors.push("Test 2B Failed: " + e.message);
    }

    // --- TEST 3: Debuffs & Clamping ---
    // Enemy Tactics
    // op_novelty (Lvl 10) -> -30% (Opening) -> 0.7
    // inst_tac_deb (Lvl 10) -> -10% (General/Phase?) - Wait, inst_tac_deb is 'Blunt Edge': "Enemy Tactics -1% per level."
    // Let's assume it applies always or phase specific?
    // README/Memory says: "Tier 3 skills include Debuffs... during specific phases".
    // inst_tac_deb is Instinct Tier 2 Disruption. "Enemy Tactics -1% per level." usually applies generally or in matching phase?
    // Let's check logic implementation plan: "Enemy Debuffs: Apply Tier 3 Debuffs and Instinct Debuffs."
    // Assuming multiplicative stacking for debuffs? Or additive?
    // "Base * (1 - Debuff%)" or "Base * (1 - D1) * (1 - D2)"?
    // User said: "Debuffs: Ensure they clamp properly (Enemy stats cannot go below 10% of base)."
    // Usually debuffs stack additively? "3% + 1% = 4% reduction".
    // I will implement additive debuff sum.

    // Test Clamping
    // Debuff 100% (Lvl 34 Novelty -> 102%?)
    // Result should be 10% of Base.

    const debuffSkills = {
        op_novelty: 50 // 150% reduction
    };

    try {
        const snap = getSnapshot(5, baseStats, baseStats, debuffSkills, mockPhaseConfig, { phase1Won: false });
        const expected = 10; // 10% of 100
        if (Math.abs(snap.enemyStats.opening - expected) > 0.001) {
             errors.push(`T3 Debuff Clamp mismatch. Got ${snap.enemyStats.opening}, expected ${expected}`);
        } else {
             console.log("Test 3 (Debuff Clamp): Pass");
        }
    } catch (e) {
        errors.push("Test 3 Failed: " + e.message);
    }

    // --- REPORT ---
    if (errors.length > 0) {
        console.error("AUDIT FAILED WITH ERRORS:");
        errors.forEach(e => console.error(e));
        process.exit(1);
    } else {
        console.log("ALL TESTS PASSED");
        process.exit(0);
    }
}

// Since getSnapshot might not exist yet, we wrap in try-catch to avoid instant crash on import if using require in other envs,
// but here we are using ESM. If getSnapshot is missing, the import will fail.
// We will rely on the implementation step to fix the export.
runAudit();
