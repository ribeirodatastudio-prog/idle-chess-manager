
import { calculatePuzzleDifficulty, calculateSacrificeMultiplier, resolvePuzzle } from '../src/logic/puzzles.js';
import { PUZZLE_THEMES } from '../src/data/puzzles.js';

console.log('--- VERIFYING PUZZLE LOGIC ---');

// 1. Test Difficulty Range
console.log('\n1. Testing Difficulty Range (Base Elo 100):');
let min = 999, max = 0;
for(let i=0; i<100; i++) {
    const d = calculatePuzzleDifficulty(100);
    if(d < min) min = d;
    if(d > max) max = d;
}
console.log(`   Range: ${min.toFixed(2)} - ${max.toFixed(2)} (Expected ~90 - ~110)`);
if (min < 90 || max > 110) console.error('FAIL: Difficulty out of bounds');
else console.log('PASS: Difficulty looks correct.');


// 2. Test Sacrifice Multiplier
console.log('\n2. Testing Sacrifice Multiplier:');

const checkSac = (lvl, expectedMult) => {
    const m = calculateSacrificeMultiplier(lvl);
    const diff = Math.abs(m - expectedMult);
    if (diff < 0.001) console.log(`   Level ${lvl}: Multiplier ${m.toFixed(2)} [PASS]`);
    else console.error(`   Level ${lvl}: Multiplier ${m.toFixed(2)} (Expected ${expectedMult}) [FAIL]`);
};

// Level 10 -> Chance 2% (0.02) -> Mult 0.2
checkSac(10, 0.2);
// Level 50 -> Chance 10% (0.10) -> Mult 1.0
checkSac(50, 1.0);
// Level 500 -> Chance 100% (1.00) -> Mult 10.0
checkSac(500, 10.0);


// 3. Test Resolution (Standard)
console.log('\n3. Testing Resolution (Standard: Opening + Midgame):');
const themeStd = PUZZLE_THEMES.find(t => t.id === 'op_mid');
const statsStd = { opening: 100, midgame: 100, sacrifices: 10 };
const resStd = resolvePuzzle(themeStd, statsStd, 200); // 100 + 100 = 200
console.log(`   Power: ${resStd.totalPower}, Target: 200. Success: ${resStd.success}`);
if (resStd.totalPower === 200 && resStd.success) console.log('   [PASS] Standard Sum');
else console.error('   [FAIL] Standard Sum');


// 4. Test Resolution (Sacrifice)
console.log('\n4. Testing Resolution (Sacrifice: Opening + Sacrifice):');
const themeSac = PUZZLE_THEMES.find(t => t.id === 'op_sac');
// Player has Opening 100, Sacrifice Level 10 (Mult 0.2)
// Logic: Opening (100) + SacVal (Opening * 0.2 = 20) = 120
const statsSac = { opening: 100, sacrifices: 10 };
const resSac = resolvePuzzle(themeSac, statsSac, 100);

console.log(`   Stats: Opening 100, Sac Lvl 10 (Mult 0.2)`);
console.log(`   Expected Power: 100 + (100 * 0.2) = 120`);
console.log(`   Actual Power: ${resSac.totalPower}`);

if (Math.abs(resSac.totalPower - 120) < 0.1) console.log('   [PASS] Sacrifice Math (Low Level)');
else console.error('   [FAIL] Sacrifice Math (Low Level)');

// High Level Sac Test
const statsSacHigh = { opening: 100, sacrifices: 50 }; // Mult 1.0
const resSacHigh = resolvePuzzle(themeSac, statsSacHigh, 100);
console.log(`   Stats: Opening 100, Sac Lvl 50 (Mult 1.0)`);
console.log(`   Expected Power: 100 + (100 * 1.0) = 200`);
console.log(`   Actual Power: ${resSacHigh.totalPower}`);

if (Math.abs(resSacHigh.totalPower - 200) < 0.1) console.log('   [PASS] Sacrifice Math (High Level)');
else console.error('   [FAIL] Sacrifice Math (High Level)');

console.log('\n--- VERIFICATION COMPLETE ---');
