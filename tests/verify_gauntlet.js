import { generateOpponentStats } from '../src/logic/simulation.js';
import { TOURNAMENT_CONFIG } from '../src/logic/tournaments.js';

console.log("=== Verifying Gauntlet Logic ===");

// 1. Check School Tournament (T0), Tier 0, Match 0
const t0_t0_m0 = { tournamentIndex: 0, tierIndex: 0, matchIndex: 0 };
const stats1 = generateOpponentStats(t0_t0_m0);
console.log(`\n[T0-Tier0-Match0] Name: ${stats1.tournamentName}`);
console.log(`Expected Elo ~ ${TOURNAMENT_CONFIG[0].minElo}. Actual: ${stats1.totalPower}`);

// 2. Check Match Multiplier
const t0_t0_m2 = { tournamentIndex: 0, tierIndex: 0, matchIndex: 2 };
const stats2 = generateOpponentStats(t0_t0_m2);
console.log(`\n[T0-Tier0-Match2] Expected Multiplier 1.05x`);
console.log(`Base Elo ~600. Target ~630. Actual: ${stats2.totalPower}`);

// 3. Check Tournament Progression (T1 - Club Cup)
const t1_t0_m0 = { tournamentIndex: 1, tierIndex: 0, matchIndex: 0 };
const stats3 = generateOpponentStats(t1_t0_m0);
console.log(`\n[T1-Tier0-Match0] Name: ${stats3.tournamentName}`);
console.log(`Expected Elo ~ ${TOURNAMENT_CONFIG[1].minElo} (800). Actual: ${stats3.totalPower}`);

// 4. Check Final Tournament (Simulator Full Force T19)
const t19 = { tournamentIndex: 19, tierIndex: 9, matchIndex: 2 };
const statsMax = generateOpponentStats(t19);
console.log(`\n[T19-Tier9-Match2] Name: ${statsMax.tournamentName}`);
console.log(`Expected Elo ~1.05 Billion. Actual: ${statsMax.totalPower}`);

console.log("\n=== Logic Verification Complete ===");
