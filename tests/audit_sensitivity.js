
import { calculateMove } from '../src/logic/simulation.js';

// --- Constants ---
const PHASES = {
  OPENING: { start: 1, end: 10 }
};
const MOVE_NUMBER = 10;
const GAMMA = 1.6;
const MIN_PROG = 0.30;
// At Move 10 (End of Opening)
const K_PHASE = 0.35;
const MAX_CLAMP = 0.45;

// --- Math Simulation ---
function simulateMath(playerEff, enemyEff, S) {
    const r = Math.log(playerEff / enemyEff);
    const adv = Math.tanh(Math.abs(r) / S);
    const rawMag = MIN_PROG + (1.0 - MIN_PROG) * Math.pow(adv, GAMMA);
    const deltaMag = K_PHASE * rawMag;

    // Direction
    const sign = (playerEff >= enemyEff) ? 1 : -1;
    const finalDelta = Math.min(MAX_CLAMP, Math.max(-MAX_CLAMP, sign * deltaMag));

    return {
        r: r.toFixed(4),
        adv: adv.toFixed(4),
        rawMag: rawMag.toFixed(4),
        finalDelta: finalDelta.toFixed(4),
        isSaturated: (Math.abs(finalDelta) >= (K_PHASE * 0.99)) // Hit 99% of K_phase cap
    };
}

// --- Scenarios ---
const scenarios = [
    { name: 'A (0%)', p: 10000, e: 10000 },
    { name: 'B (2%)', p: 10200, e: 10000, targetMin: 0.12, targetMax: 0.18 },
    { name: 'C (15%)', p: 11500, e: 10000, targetMin: 0.25, targetMax: 0.30 },
    { name: 'D (50%)', p: 15000, e: 10000, targetMin: 0.34, targetMax: 0.35 }, // Cap
    { name: 'E (100%)', p: 20000, e: 10000 }
];

const s_values = [0.15, 0.20, 0.25, 0.30, 0.40, 0.50, 0.60];

console.log('=== SENSITIVITY AUDIT ===');
console.log(`Move: ${MOVE_NUMBER}, K_phase: ${K_PHASE}, MaxClamp: ${MAX_CLAMP}`);
console.log('Targets based on Prompt:');
console.log('  B (2%): 0.12 - 0.18');
console.log('  C (15%): 0.25 - 0.30');
console.log('  D (50%): ~0.35 (Saturation)');

s_values.forEach(S => {
    console.log(`\n--- Testing S = ${S.toFixed(2)} ---`);
    console.table(scenarios.map(scen => {
        const res = simulateMath(scen.p, scen.e, S);
        let status = 'OK';
        const val = parseFloat(res.finalDelta);
        if (scen.targetMin && (val < scen.targetMin || val > scen.targetMax)) {
            status = 'MISS';
        }
        return {
            Scenario: scen.name,
            Diff: `${((scen.p/scen.e - 1)*100).toFixed(0)}%`,
            Ratio_r: res.r,
            Adv_tanh: res.adv,
            FinalDelta: res.finalDelta,
            Saturated: res.isSaturated ? 'YES' : 'No',
            Status: status
        };
    }));
});
