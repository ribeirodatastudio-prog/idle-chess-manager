import { calculateMove } from '../src/logic/simulation.js';

// Mock dependencies
const playerStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };
const enemyStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };

console.log("Verifying Mode Weights...");

const playerTheoryAdv = { ...playerStats, opening: 20 };
const enemyBase = { ...enemyStats, opening: 10 };

// 1. Classical vs Blitz (Theory)
const resClassical = calculateMove(1, playerTheoryAdv, enemyBase, 0, {}, false, 0, 'classical');
const resBlitz = calculateMove(1, playerTheoryAdv, enemyBase, 0, {}, false, 0, 'blitz');

console.log(`Classical Theory Delta: ${resClassical.delta.toFixed(3)}`);
console.log(`Blitz Theory Delta: ${resBlitz.delta.toFixed(3)}`);

if (resClassical.delta > resBlitz.delta) {
    console.log("PASS: Classical rewards Theory more than Blitz.");
} else {
    console.error("FAIL: Weighting incorrect.");
}

// 2. Blitz vs Classical (Instinct)
const playerInstinctAdv = { ...playerStats, tactics: 20 };
const resBlitzInst = calculateMove(1, playerInstinctAdv, enemyBase, 0, {}, false, 0, 'blitz');
const resClassicalInst = calculateMove(1, playerInstinctAdv, enemyBase, 0, {}, false, 0, 'classical');

console.log(`Blitz Instinct Delta: ${resBlitzInst.delta.toFixed(3)}`);
console.log(`Classical Instinct Delta: ${resClassicalInst.delta.toFixed(3)}`);

if (resBlitzInst.delta > resClassicalInst.delta) {
     console.log("PASS: Blitz rewards Instinct more than Classical.");
} else {
     console.error("FAIL: Weighting incorrect.");
}
