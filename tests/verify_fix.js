
import { calculateMove } from '../src/logic/simulation.js';

// Helper
function generateStats(total) {
    return {
        opening: total,
        midgame: 0,
        endgame: 0,
        tactics: 0,
        sacrifices: 0,
        defense: 0
    };
}

console.log('=== VERIFYING CODE FIX ===');
console.log('Testing Scenario D (50% Diff) - Expecting ~0.35');

const pD = generateStats(15000);
const eD = generateStats(10000);
const resD = calculateMove(10, pD, eD, 0, {}, false, 0, 'rapid', 0);
console.log(`Scenario D Result: ${Math.abs(resD.delta).toFixed(4)}`);

console.log('Testing Scenario B (2% Diff) - Expecting ~0.12');
const pB = generateStats(10200);
const eB = generateStats(10000);
const resB = calculateMove(10, pB, eB, 0, {}, false, 0, 'rapid', 0);
console.log(`Scenario B Result: ${Math.abs(resB.delta).toFixed(4)}`);
