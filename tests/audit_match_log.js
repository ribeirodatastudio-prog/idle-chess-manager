
import { calculateMove, generateOpponentStats } from '../src/logic/simulation.js';
import { STATS } from '../src/logic/math.js';

// --- Setup ---
const USER_STATS = {
    opening: 6,
    midgame: 1,
    endgame: 1,
    tactics: 1,
    sacrifices: 1,
    defense: 1
};

// Simulate 50 Elo Opponent
// We pass a rankData object that results in ~50 Elo.
// Config[0] usually has minElo 50, maxElo 100? Let's check logic or just use the generator.
// Tier 0, Match 0 => Base Elo = Min Elo.
const OPPONENT_CONFIG = { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 };
const opponentObj = generateOpponentStats(OPPONENT_CONFIG);
const ENEMY_STATS = opponentObj.stats;
const ENEMY_ELO = opponentObj.totalPower;

console.log('=== DIAGNOSTIC CONFIGURATION ===');
console.log('Player Stats:', JSON.stringify(USER_STATS));
console.log(`Enemy Elo: ${ENEMY_ELO}`);
console.log('Enemy Stats:', JSON.stringify(ENEMY_STATS));
console.log('S (Sensitivity): 0.15 (Hardcoded in Simulation)');
console.log('Mode: Rapid');

// --- Simulation Loop ---
let currentEval = 0.05; // Starting from user log move 1
const MOVES_TO_SIMULATE = 23;

console.log('\n=== TURN-BY-TURN TRACE ===');

for (let move = 1; move <= MOVES_TO_SIMULATE; move++) {
    // We need to capture the internal math.
    // Since calculateMove doesn't return intermediate vars like 'r' or 'adv' explicitly
    // (it returns K_phase/EffectiveStats), we will reconstruct the math here
    // to match the exact logic in simulation.js for the log.

    // 1. Run actual simulation to get the Delta/Result
    const result = calculateMove(move, USER_STATS, ENEMY_STATS, currentEval, {}, false, 0, 'rapid', 0);

    // 2. Reconstruct Math for Logging
    const pStats = result.effectivePlayerStats;
    const eStats = result.effectiveEnemyStats;

    // Determine Phase & Base Sums (Exact logic copy from simulation.js)
    let phase = '';
    let pBase = 0;
    let eBase = 0;

    if (move <= 10) {
        phase = 'Opening';
        pBase = pStats.opening + (pStats.tactics * 0.2);
        eBase = eStats.opening + (eStats.tactics * 0.2);
    } else if (move <= 30) {
        phase = 'Midgame';
        pBase = pStats.midgame + (pStats.tactics * 0.8);
        eBase = eStats.midgame + (eStats.tactics * 0.8);
    } else {
        phase = 'Endgame';
        pBase = pStats.endgame + (pStats.tactics * 1.5);
        eBase = eStats.endgame + (eStats.tactics * 1.5);
    }

    const pEff = Math.max(1.0, pBase);
    const eEff = Math.max(1.0, eBase);

    const r = Math.log(pEff / eEff);
    const S = 0.15;
    const adv = Math.tanh(Math.abs(r) / S);
    const gamma = 1.6;
    const minProg = 0.30;
    const rawMag = minProg + (1.0 - minProg) * Math.pow(adv, gamma);
    const K = result.K_phase;
    const deltaMag = K * rawMag;

    console.log(`\n--- Move ${move} (${phase}) ---`);
    console.log(`Stats Used: Player=${pEff.toFixed(2)} vs Enemy=${eEff.toFixed(2)}`);
    console.log(`Ratio (r): ln(${pEff.toFixed(2)}/${eEff.toFixed(2)}) = ${r.toFixed(4)}`);
    console.log(`Advantage (tanh): tanh(|${r.toFixed(4)}| / 0.15) = ${adv.toFixed(4)}`);
    console.log(`RawMag: ${minProg} + (0.7 * ${adv.toFixed(4)}^1.6) = ${rawMag.toFixed(4)}`);
    console.log(`MaxCap (K_phase): ${K.toFixed(4)}`);
    console.log(`Calculated Mag: ${deltaMag.toFixed(4)}`);
    console.log(`ACTUAL DELTA: ${result.delta.toFixed(4)}`);
    console.log(`New Eval: ${result.newEval.toFixed(2)}`);

    currentEval = result.newEval;
}

// --- Balanced Test ---
console.log('\n=== CONTROL GROUP: BALANCED STATS ===');
console.log('Scenario: Player 10 vs Enemy 10 (All Stats)');
const BALANCED_STATS = { opening: 10, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10, defense: 10 };
const balRes = calculateMove(1, BALANCED_STATS, BALANCED_STATS, 0, {}, false, 0, 'rapid', 0);
console.log(`Move 1 Result: Delta=${balRes.delta.toFixed(4)} (Expected ~0.10 floor)`);

console.log('\nScenario: Player 12 vs Enemy 10 (20% Advantage)');
const ADV_STATS = { ...BALANCED_STATS, opening: 12 }; // 12 vs 10 in opening
const advRes = calculateMove(1, ADV_STATS, BALANCED_STATS, 0, {}, false, 0, 'rapid', 0);
console.log(`Move 1 Result: Delta=${advRes.delta.toFixed(4)}`);
