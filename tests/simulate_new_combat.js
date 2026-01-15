import { calculateMove, PHASES } from '../src/logic/simulation.js';

// Mock Skills
const noSkills = {};

// Mock Stats
const equalStats = {
    opening: 100, midgame: 100, endgame: 100,
    tactics: 100, sacrifices: 100, defense: 100
};

const strongStats = {
    opening: 150, midgame: 150, endgame: 150,
    tactics: 150, sacrifices: 150, defense: 150
};

const weakStats = {
    opening: 50, midgame: 50, endgame: 50,
    tactics: 50, sacrifices: 50, defense: 50
};

function simulateBatch(name, playerStats, enemyStats, moveNum, count) {
    let playerWins = 0;
    let sumDelta = 0;
    let sumAbsDelta = 0;

    for (let i = 0; i < count; i++) {
        // Assume eval 0 for isolation
        const result = calculateMove(moveNum, playerStats, enemyStats, 0, noSkills, false, 0, 'rapid', 0);

        sumDelta += result.delta;
        sumAbsDelta += Math.abs(result.delta);

        // "Player Win" in this context is "Positive Delta"
        if (result.delta > 0) playerWins++;
    }

    const winRate = (playerWins / count) * 100;
    const avgDelta = sumDelta / count;
    const avgMag = sumAbsDelta / count;

    console.log(`[${name}] Move ${moveNum} (${count} runs):`);
    console.log(`  Win Rate: ${winRate.toFixed(1)}%`);
    console.log(`  Avg Delta: ${avgDelta.toFixed(4)}`);
    console.log(`  Avg Mag: ${avgMag.toFixed(4)}`);
    console.log('-----------------------------------');
}

console.log('=== COMBAT SIMULATION VERIFICATION ===\n');

// 1. Equal Stats - Opening
simulateBatch('Equal - Opening', equalStats, equalStats, 5, 1000);

// 2. Equal Stats - Midgame
simulateBatch('Equal - Midgame', equalStats, equalStats, 25, 1000);

// 3. Strong Player - Midgame
simulateBatch('Strong Player - Midgame', strongStats, equalStats, 25, 1000);

// 4. Weak Player - Midgame
simulateBatch('Weak Player - Midgame', weakStats, equalStats, 25, 1000);

// 5. Extreme Advantage - Endgame
simulateBatch('God Mode - Endgame', { ...strongStats, endgame: 1000 }, equalStats, 45, 1000);
