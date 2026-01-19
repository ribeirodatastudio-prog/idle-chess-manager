import { simulateGame } from '../src/logic/simulation.js';

// Mock Stats
const playerStats = {
    opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10, defense: 10
};
const enemyStats = {
    opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10, defense: 10
};
const skills = {};

console.log("Starting Simulation...");
const history = simulateGame(playerStats, enemyStats, skills, 'bullet');

console.log(`Simulation Complete. Total Moves: ${history.length}`);

if (history.length === 0) {
    console.error("FAIL: History is empty.");
    process.exit(1);
}

const firstMove = history[0];
if (typeof firstMove.MaxClamp === 'undefined') {
    console.error("FAIL: MaxClamp is missing from move result.");
    process.exit(1);
}

console.log("First Move MaxClamp:", firstMove.MaxClamp);
console.log("Last Move Result:", history[history.length - 1].result);

console.log("PASS: Simulation returned valid history with MaxClamp.");
