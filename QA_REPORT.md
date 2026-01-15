# QA Report: Combat Engine Upgrade

## 1. Executive Summary
**Issue:** User reported a logical anomaly where winning a move in a "lost" position resulted in a massive evaluation swing (equal to the opponent's winning magnitude).
**Root Cause:** The previous engine used "Disparity Magnitude" regardless of *who* won the move. If the enemy was 10x stronger, the "Move Size" was maxed out. If the player won a 1% probability roll, they "stole" that maxed-out move size.
**Fix:** Implemented **Direct Probability Mapping**.
*   **Efficiency = Probability:** The winner's damage efficiency is now directly mapped to their probability of winning the move.
*   **The "Lucky Shot" Rule:** If a player with 1% chance wins, their efficiency is clamped to **20%** (Floor).
*   **The "Killer Instinct" Rule:** If a player with >90% chance wins, their efficiency is **100%** (Cap).

## 2. Verification Data

### Scenario A: The "Stomp" (Player has ~1% Chance)
*Old Behavior:*
*   Enemy Wins: Delta = -0.35 (Max)
*   Player Wins: Delta = +0.35 (Max) -> *Unrealistic volatility.*

*New Behavior:*
*   Enemy Wins (99% Prob): Efficiency = 1.0 (Cap). Delta ≈ **-0.35**.
*   Player Wins (1% Prob): Efficiency = 0.20 (Floor). Delta ≈ **+0.07**.
*   *Result:* losing players can fight back, but they can't land "Nuclear hits" just by getting lucky.

### Scenario B: Balanced Game (50/50)
*Old Behavior:*
*   Delta ≈ 0.08 (Fixed Floor).

*New Behavior:*
*   Efficiency ≈ 0.50.
*   Delta = Base * 0.50 ≈ **0.04**.
*   *Result:* Balanced games are tighter, more positional, and "drawish", matching real chess logic.

### Scenario C: User's Specific Case (6 vs 20 Stats)
The user is still severely outmatched (11x stat difference in Midgame).
*   **Outcome:** The user will likely lose every move.
*   **Improvement:** If the user *does* win a move, it will now be a small positional gain (+0.07) rather than a confusing "+0.30" spike.

## 3. Revised Formulas (Source of Truth)

**Efficiency Calculation:**
```javascript
// 1. Identify Winner's Probability
const winnerProb = isPlayerWinner ? p : (1.0 - p);

// 2. Map to Efficiency
let efficiency = winnerProb;

// 3. Apply Constraints
if (efficiency < 0.20) efficiency = 0.20; // Luck Floor
if (efficiency >= 0.90) efficiency = 1.0; // Killer Instinct Cap
```

**Final Delta:**
```javascript
// Variance (0.9 to 1.1) adds organic noise
finalDelta = sign * deltaMag * efficiency * variance;
```
