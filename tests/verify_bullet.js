import { calculateMove, applyModeWeights } from '../src/logic/simulation.js';

const stats = { opening: 100, midgame: 100, endgame: 100, tactics: 100, sacrifices: 100, defense: 100 };

console.log("Verifying Bullet Logic...");

// 1. Verify Weights
const bulletStats = applyModeWeights(stats, 'bullet');
if (bulletStats.tactics === 250 && bulletStats.opening === 10 && bulletStats.sacrifices === 10) {
    console.log("PASS: Bullet Weights applied correctly.");
} else {
    console.error("FAIL: Bullet Weights incorrect.", bulletStats);
    process.exit(1);
}

// 2. Verify Delta Scaling
const resBullet = calculateMove(15, stats, stats, 0, {}, false, 0, 'bullet');
console.log('Bullet Move Result:', resBullet);

console.log("PASS: Verification Complete.");
