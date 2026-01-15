# QA Report: Combat Sensitivity Audit

## 1. Executive Summary
**Issue:** User reported that game evaluations always hit the maximum cap ("Stomp") even in seemingly early game states.
**Audit Result:** The combat formula is **working correctly**. The observed "saturation" is due to extreme stat disparities in the provided user case (User stats ~1 vs Opponent stats ~20 in Midgame), which mathematically results in a >99% loss probability per move.
**Sensitivity Adjustment:** The Sensitivity constant `S` has been adjusted to `0.15` to ensure that a **50% Skill Difference** reliably triggers this maximum saturation, while smaller differences (e.g., 20%) allow for dynamic gameplay.

## 2. User Case Analysis
**Scenario:**
- **Player Stats:** Opening: 6, All Others: 1.
- **Opponent Stats (50 Elo):** Opening: ~18, Midgame: ~10, Endgame: ~12, Tactics: ~13.

### Why the "Stomp" Happens
The combat engine calculates "Efficiency" based on the current phase.
1.  **Opening (Move 1-10):**
    *   **Player Eff:** 6.2 (6 + 1*0.2)
    *   **Enemy Eff:** 20.6 (18 + 13*0.2)
    *   **Ratio:** `ln(6.2 / 20.6) = -1.20`.
    *   **Result:** The enemy is **3.3x stronger** than the player. This is >300% difference, far exceeding the 50% saturation point.
    *   **Outcome:** Immediate Max Cap loss (-0.25 to -0.35 per turn).

2.  **Midgame (Move 11-30):**
    *   **Player Eff:** 1.8 (1 + 1*0.8)
    *   **Enemy Eff:** 20.4 (10 + 13*0.8)
    *   **Ratio:** `ln(1.8 / 20.4) = -2.42`.
    *   **Result:** The enemy is **11x stronger**.
    *   **Outcome:** Immediate Max Cap loss.

### Detailed Math Trace (From Diagnostic Log)
*S = 0.15 (High Sensitivity)*

| Move | Phase | Player Eff | Enemy Eff | Ratio (r) | Advantage (tanh) | Raw Mag | Final Delta | Eval |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Opening | 6.20 | 20.60 | -1.20 | 1.00 (Max) | 1.00 | **-0.25** | -0.20 |
| **5** | Opening | 6.20 | 20.60 | -1.20 | 1.00 (Max) | 1.00 | **-0.29** | -1.31 |
| **10** | Opening | 6.20 | 20.60 | -1.20 | 1.00 (Max) | 1.00 | **-0.35** | -2.95 |
| **11** | Midgame | 1.80 | 20.40 | -2.43 | 1.00 (Max) | 1.00 | **-0.35** | -3.30 |
| **15** | Midgame | 1.80 | 20.40 | -2.43 | 1.00 (Max) | 1.00 | **-0.40** | -4.83 |
| **23** | Midgame | 1.80 | 20.40 | -2.43 | 1.00 (Max) | 1.00 | **-0.51** | -8.53 |

**Conclusion:** The math accurately reflects that a player with Stat 1 is being crushed by an opponent with Stat 10+.

## 3. Control Group: Balanced Play
To prove the formula allows for small increments when matched fairly:

**Scenario A: Perfect Balance (10 vs 10)**
*   **Ratio:** 0.00
*   **Advantage:** 0.00
*   **Final Delta:** **0.075** (Minimum Floor).
*   *Result: Small, tense game.*

**Scenario B: Moderate Advantage (12 vs 10, +20%)**
*   **Ratio:** `ln(1.2) = 0.18`.
*   **Advantage:** `tanh(0.18 / 0.15) = 0.83`.
*   **Final Delta:** **0.19**.
*   *Result: Decisive but not instant stomp.*

## 4. Recommendations
1.  **Stat Balance:** The user needs to upgrade Midgame/Tactics stats to compete, as "1" is effectively zero power against even the weakest bots (Rank 0, Tier 0).
2.  **Formula Status:** The formula with `S=0.15` is performing exactly as requested:
    *   Small diff (0-20%) -> Small/Medium Delta (0.07 - 0.19).
    *   Large diff (>50%) -> Max Delta (Saturation).
