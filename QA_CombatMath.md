# QA Report: Combat Math & Simulation Analysis

## A. Executive Summary

**Overall Health:** ✅ **EXCELLENT**

The combat math engine (`simulation.js`) and economy logic (`useGameState.js`) are robust and accurately implement the specific design requirements. The simulation correctly handles complex stacking of multipliers, conditional logic (e.g., "If Phase 1 Won"), and dynamic scaling based on turn count.

**Critical Bugs:** None found.
**Minor Findings:**
1.  **Phase Configuration Dependency:** The `calculateMove` function relies on the caller (e.g., `App.jsx`) to inject the `phaseConfig` object. If this is omitted (as was the case in initial testing), Phase Extender skills (e.g., `op_extender`) are ignored. This is not a bug in the game (since `App.jsx` handles it), but it is a potential fragility in the architecture.

## B. Skill Audit Table

| Skill ID | Tooltip Promise | Code Implementation | Discrepancy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **op_novelty** | Debuff: Enemy Opening Stats -3%/lvl | `enemyStats.opening *= (1 - 0.03 * lvl)` | None | ✅ PASS |
| **op_space** | Momentum: If Opening Won, +4% All Stats in Midgame | `if (phase1Won) stats *= (1 + 0.04 * lvl)` | None | ✅ PASS |
| **op_tenure** | Economy: 1.05x Prod per Opening Branch Level | `1.05 ^ (BranchLevels * TenureLvl)` | None | ✅ PASS |
| **mid_cloud** | Debuff: Enemy Tactics -3%/lvl | `enemyStats.tactics *= (1 - 0.03 * lvl)` | None | ✅ PASS |
| **mid_simplify** | Momentum: If Midgame Won, +4% All Stats in Endgame | `if (phase2Won) stats *= (1 + 0.04 * lvl)` | None | ✅ PASS |
| **mid_tenure** | Economy: 1.05x Prod per Midgame Branch Level | `1.05 ^ (BranchLevels * TenureLvl)` | None | ✅ PASS |
| **end_tablebase** | Debuff: Enemy Defense -3%/lvl | `enemyStats.defense *= (1 - 0.03 * lvl)` | None | ✅ PASS |
| **end_zugzwang** | Decay: Enemy stats -1% per turn > Turn 30 | `mult = 1.0 - (0.01 * lvl * (turn - 30))` | None | ✅ PASS |
| **end_tenure** | Economy: 1.05x Prod per Endgame Branch Level | `1.05 ^ (BranchLevels * TenureLvl)` | None | ✅ PASS |
| **inst_tac_deb** | Disruption: Enemy Tactics -1%/lvl | `enemyStats.tactics *= (1 - 0.01 * lvl)` | None | ✅ PASS |
| **inst_tac_econ** | Hustle: +1% Prod per SP spent in Tactics | `1 + (0.01 * lvl * SP_Spent)` | None | ✅ PASS |
| **inst_tac_scale**| Momentum: Tactics x1.005^Turn | `stats.tactics *= 1.005 ^ turn` | None | ✅ PASS |
| **inst_def_deb** | Disruption: Enemy Defense -1%/lvl | `enemyStats.defense *= (1 - 0.01 * lvl)` | None | ✅ PASS |
| **inst_def_econ** | Hustle: +1% Prod per SP spent in Defense | `1 + (0.01 * lvl * SP_Spent)` | None | ✅ PASS |
| **inst_def_scale**| Momentum: Defense x1.005^Turn | `stats.defense *= 1.005 ^ turn` | None | ✅ PASS |
| **inst_sac_deb** | Disruption: Enemy Endgame -1%/lvl | `enemyStats.endgame *= (1 - 0.01 * lvl)` | None | ✅ PASS |
| **inst_risk_econ**| Hustle: +1% Prod per SP spent in Risk | `1 + (0.01 * lvl * SP_Spent)` | None | ✅ PASS |
| **inst_sac_scale**| Momentum: Sacrifice Chance x1.005^Turn | `chance *= 1.005 ^ turn` | None | ✅ PASS |

## C. Phase Logic Verification

The simulation relies on `getPhaseConfig` to determine boundaries.

*   **Test:** Simulating `op_extender` Level 3.
*   **Log:** "Turn 11 Phase: Opening" (Correct, extended from 10 to 13).
*   **Log:** "Turn 14 Phase: Midgame" (Correct, transition happens).
*   **Note:** This logic requires `phaseConfig` to be passed explicitly to `calculateMove`.

## D. Stacking Logic Analysis

The engine uses a **Multiplicative Stacking** model, which aligns with the "Compound Interest" design philosophy.

**Example Verified:**
*   Base Stat: 100
*   Tier 1 (Mastery): +10% (`x1.1`)
*   Instinct Root: +10% (`x1.1`)
*   Scaling (Turn 10): `1.005^10` (`x1.051`)

**Formula:**
`Total = Base * 1.1 * 1.1 * 1.051 = 127.18`

This confirms that buffs from different sources (Phase Mastery, Instinct, Scaling) multiply together, creating powerful late-game spikes.

## E. Economy Audit

1.  **Academic Tenure (Study Tree):**
    *   Logic: `1.05 ^ (Total Branch Levels * Tenure Skill Level)`
    *   Status: **Verified**. Correctly counts all owned levels in the specific branch (Opening/Mid/End) including the Root skill.

2.  **Instinct Hustle (Instinct Tree):**
    *   Logic: `1 + (0.01 * Hustle Skill Level * Total SP Spent in Branch)`
    *   Status: **Verified**. Correctly sums SP cost of all owned skills in the branch to calculate the multiplier.

---
**Signed off by:** Lead QA Engineer
