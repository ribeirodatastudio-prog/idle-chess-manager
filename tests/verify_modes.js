import { calculateMove } from '../src/logic/simulation.js';

// Mock dependencies
const playerStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };
const enemyStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };

console.log("Verifying Mode Weights...");

// 1. Test Classical (Theory favored)
// Player: High Theory (20), Normal Instinct (10)
// Enemy: Normal Theory (10), Normal Instinct (10)
// Classical weights: Theory 1.5, Instinct 0.6
// Player Theory Score: 20 * 1.5 = 30. Enemy Theory: 10 * 1.5 = 15. Delta +15.
// Result should be heavily favored for player in Theory phases.

const playerTheoryAdv = { ...playerStats, opening: 20 };
const enemyBase = { ...enemyStats, opening: 10 };

// Move 1 (Opening)
const resClassical = calculateMove(1, playerTheoryAdv, enemyBase, 0, {}, false, 0, 'classical');
console.log(`Classical (Opening Adv): New Eval = ${resClassical.newEval.toFixed(2)}`);

if (resClassical.newEval > 0.5) { // Expecting significant advantage
    console.log("PASS: Classical mode favors Theory stats.");
} else {
    console.error("FAIL: Classical mode weight issue.");
}

// 2. Test Blitz (Instinct favored)
// Player: High Theory (20), Normal Instinct (10)
// Blitz weights: Theory 0.6.
// Player Theory Score: 20 * 0.6 = 12. Enemy: 10 * 0.6 = 6. Delta +6.
// Advantage should be smaller than Classical (+15).

const resBlitz = calculateMove(1, playerTheoryAdv, enemyBase, 0, {}, false, 0, 'blitz');
console.log(`Blitz (Opening Adv): New Eval = ${resBlitz.newEval.toFixed(2)}`);

if (resBlitz.newEval < resClassical.newEval) {
    console.log("PASS: Blitz mode reduces Theory impact.");
} else {
    console.error("FAIL: Blitz mode should have lower theory impact.");
}

// 3. Test Blitz Instinct
// Player High Instinct (20). Blitz weights: Instinct 1.8.
// Player Instinct: 20 * 1.8 = 36. Enemy: 10 * 1.8 = 18. Delta +18.
const playerInstinctAdv = { ...playerStats, tactics: 20 };
const resBlitzInstinct = calculateMove(1, playerInstinctAdv, enemyBase, 0, {}, false, 0, 'blitz');
console.log(`Blitz (Instinct Adv): New Eval = ${resBlitzInstinct.newEval.toFixed(2)}`);

if (resBlitzInstinct.newEval > 1.0) {
     console.log("PASS: Blitz mode amplifies Instinct stats.");
} else {
     console.error("FAIL: Blitz mode weight issue.");
}
