import { calculateMove, PHASES } from '../src/logic/simulation.js';

// Mock dependencies
const mockPlayerStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };
const mockEnemyStats = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };
const mockSkills = {};

console.log("Testing Tie-Breaker Logic...");

// Scenario A: Player has higher aggression
const playerAdv = { ...mockPlayerStats, tactics: 20 };
const enemyBase = { ...mockEnemyStats, tactics: 10 };

const resultA = calculateMove(50, playerAdv, enemyBase, 0, {}, false, 0);
if (resultA.result === 'win' && resultA.logMessage.includes('Tactical Superiority')) {
    console.log("PASS: Player won via Tie-Breaker.");
} else {
    console.error("FAIL: Player should win via Tie-Breaker. Got:", resultA);
}

// Scenario B: Enemy has higher aggression
const playerBase = { ...mockPlayerStats, tactics: 10 };
const enemyAdv = { ...mockEnemyStats, tactics: 20 };

const resultB = calculateMove(50, playerBase, enemyAdv, 0, {}, false, 0);
if (resultB.result === 'loss' && resultB.logMessage.includes('Tactical Superiority')) {
    console.log("PASS: Enemy won via Tie-Breaker.");
} else {
    console.error("FAIL: Enemy should win via Tie-Breaker. Got:", resultB);
}

// Scenario C: Equal Aggression (True Draw)
const resultC = calculateMove(50, playerBase, enemyBase, 0, {}, false, 0);
if (resultC.result === 'draw') {
    console.log("PASS: True Draw occurred with equal stats.");
} else {
    console.error("FAIL: Should be a draw. Got:", resultC);
}

console.log("Testing Snowball Execution...");
const endgameResult = calculateMove(35, mockPlayerStats, mockEnemyStats, 5.0, {}, false, 0);
console.log(`Endgame Move 35, Start Eval 5.0 -> New Eval: ${endgameResult.newEval.toFixed(2)}`);
if (Math.abs(endgameResult.newEval) > 5.0) {
     console.log("PASS: Snowball likely applied (Magnitude maintained or increased).");
} else {
     console.log("WARNING: Snowball might not be strong enough or negative delta occurred.");
}
