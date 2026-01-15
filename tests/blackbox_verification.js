import { calculateMove, PHASES } from '../src/logic/simulation.js';
import fs from 'fs';

const REPORT_FILE = 'QA_REPORT_BLACKBOX.md';

const logBuffer = [];
function log(msg) {
    console.log(msg);
    logBuffer.push(msg);
}

function runTests() {
    log('# QA Report: Black Box Verification\n');
    log(`Date: ${new Date().toISOString()}\n`);

    // --- TEST A: Mode Comparison ---
    log('## Test A: Mode Comparison (Turn 1 Snapshot)\n');
    log('**Scenario:** Player 10k vs Enemy 10k (All Stats 10,000)\n');

    const baseStats = {
        opening: 10000, midgame: 10000, endgame: 10000,
        tactics: 10000, sacrifices: 10000, defense: 10000
    };

    const modes = ['rapid', 'bullet', 'chess960'];

    modes.forEach(mode => {
        log(`### Mode: ${mode.toUpperCase()}`);
        const result = calculateMove(1, baseStats, baseStats, 0.0, {}, false, 0, mode, 0);

        const pStats = result.effectivePlayerStats;

        log(`- **Effective Tactics:** ${pStats.tactics}`);
        log(`- **Effective Defense:** ${pStats.defense}`);
        log(`- **Effective Opening:** ${pStats.opening}`);
        log(`- **Calculated Delta:** ${result.delta.toFixed(4)}`);

        // Specific Checks based on logic
        if (mode === 'bullet') {
             // Tactics x2.5 = 25000. Defense x0.1 = 1000.
             if (pStats.tactics === 25000 && pStats.defense === 1000) {
                 log('✅ **VERIFIED:** Bullet Modifiers (High Tactics, Low Defense) applied.');
             } else {
                 log('❌ **FAILED:** Bullet Modifiers incorrect.');
             }
        }

        if (mode === 'chess960') {
            // Opening x1.75 = 17500. Defense x0.85 = 8500.
            // AND Dynamic Tactics (Move 1 <= 10) -> Tactics * 1.75 = 17500.
            if (pStats.opening === 17500 && pStats.tactics === 17500) {
                 log('✅ **VERIFIED:** Chess 960 Modifiers (High Opening, Dynamic Tactics) applied.');
            } else {
                 log('❌ **FAILED:** Chess 960 Modifiers incorrect.');
            }
        }
        log('\n');
    });

    // --- TEST B: Progression Curve ---
    log('## Test B: Progression Curve (Zombie Code Check)\n');
    log('**Scenario:** Rapid Game, Moves 1-50. Checking `K_phase` interpolation.\n');

    const checkpoints = [1, 5, 10, 11, 20, 30, 31, 40, 50];
    let previousK = -1;

    log('| Move | Phase | K_phase | Check |');
    log('|---|---|---|---|');

    // Iterate all moves
    for (let move = 1; move <= 50; move++) {
        const result = calculateMove(move, baseStats, baseStats, 0.0, {}, false, 0, 'rapid', 0);
        const k = result.K_phase;

        if (checkpoints.includes(move)) {
             let status = 'Init';
             if (previousK !== -1) {
                 if (k > previousK) status = 'Growing';
                 else if (k === previousK) status = 'Static';
                 else status = 'Decreasing';
             }

             // First move of a new phase might jump significantly or not, but within phase it should grow.
             // Move 11 is start of Midgame.
             // Move 31 is start of Endgame.

             log(`| ${move} | ${result.phase} | ${k.toFixed(4)} | ${status} |`);
        }
        previousK = k;
    }

    log('\n**Observation:** We expect to see K_phase values changing at every checkpoint within the phases.\n');

    // Write to file
    fs.writeFileSync(REPORT_FILE, logBuffer.join('\n'));
    console.log(`Report written to ${REPORT_FILE}`);
}

runTests();
