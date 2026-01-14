# QA Report: Opponent Generation Audit

## Simulation Results

### Case A: Low Elo (Target: 100)
- **Actual Elo:** 106
- **Stats:** All 1 (Minimum floor applied).
- **Title:** "Solid Club Player"
- **Analysis:** Working as expected, though slightly inflated (106 vs 100) due to base stat requirement.

### Case B: Mid Elo (Target: 1000)
- **Actual Elo:** 1000
- **Stats:** Evenly distributed (~150 per stat).
- **Title:** Varies (saw "The Swindler", "Midgame Maestro").
- **Analysis:** Healthy distribution. No caps hit.

### Case C: High Elo (Target: 3000)
- **Actual Elo:** 3000
- **Stats:** Average ~483 per stat.
- **Observed Sacrifice:** 482 and 461 in tests.
- **Observed Defense:** 534 and 492 in tests.
- **Analysis:**
  - **Sacrifice Cap Risk:** HIGH. With an average of 483, random variance will frequently push Sacrifice above 500. Since 500 is 100% success chance, any point above 500 is purely wasted Elo that could have gone to Defense or Attack.
  - **Defense Weight:** Defense is receiving ~1/6th of the points. This is "fair" mathematically but might be strategically weak if the meta demands high defense to survive high-damage attacks.

## Recommendations
1. **Hard Cap Logic:** Modify `generateOpponentStats` to stop adding points to 'sacrifices' once it reaches 500, redistributing the remaining potential to other stats.
2. **Weighted Distribution:** At higher Elos, prioritize 'defense' or primary attack stats over capped utility stats.
