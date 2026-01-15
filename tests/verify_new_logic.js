
// Mocking the new logic for verification
function calculateNewDelta(p, isPlayerWinner, deltaMag) {
    // 1. Who won? What was their chance?
    const winnerProb = isPlayerWinner ? p : (1.0 - p);

    // 2. Calculate Efficiency (Direct Mapping)
    let efficiency = winnerProb;

    // Apply Floor (Min 20%)
    if (efficiency < 0.20) {
        efficiency = 0.20;
    }

    // Apply Cap (Killer Instinct at 90%+)
    if (efficiency >= 0.90) {
        efficiency = 1.0;
    }

    // 3. Final Calculation
    // We mock variance as 1.0 for deterministic testing, but note it exists
    const variance = 1.0;
    const sign = isPlayerWinner ? 1 : -1;
    const finalDelta = sign * deltaMag * efficiency * variance;

    return {
        winner: isPlayerWinner ? 'Player' : 'Enemy',
        prob: winnerProb.toFixed(4),
        eff: efficiency.toFixed(4),
        rawDelta: deltaMag.toFixed(4),
        finalDelta: finalDelta.toFixed(4)
    };
}

console.log('=== VERIFYING DIRECT PROBABILITY MAPPING ===');

const DELTA_MAG = 0.35; // Standard Max Cap magnitude

console.log(`\nCase 1: The "Stomp" (Player has 1% chance)`);
const p1 = 0.01;
// Subcase A: Enemy Wins (Expected)
console.log('A. Enemy Wins (99% Prob):');
console.log(calculateNewDelta(p1, false, DELTA_MAG));
// Subcase B: Player Gets Lucky (The Fix)
console.log('B. Player Wins (1% Prob) - "Lucky Shot":');
console.log(calculateNewDelta(p1, true, DELTA_MAG));

console.log(`\nCase 2: The "Even Match" (Player has 55% chance)`);
const p2 = 0.55;
console.log('A. Player Wins (55% Prob):');
console.log(calculateNewDelta(p2, true, DELTA_MAG));
console.log('B. Enemy Wins (45% Prob):');
console.log(calculateNewDelta(p2, false, DELTA_MAG));

console.log(`\nCase 3: "Killer Instinct" (Player has 92% chance)`);
const p3 = 0.92;
console.log('A. Player Wins (92% Prob) -> Should be Cap 1.0:');
console.log(calculateNewDelta(p3, true, DELTA_MAG));
