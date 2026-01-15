# QA Report: Black Box Verification

Date: 2026-01-15T14:48:36.517Z

## Test A: Mode Comparison (Turn 1 Snapshot)

**Scenario:** Player 10k vs Enemy 10k (All Stats 10,000)

### Mode: RAPID
- **Effective Tactics:** 10000
- **Effective Defense:** 10000
- **Effective Opening:** 10000
- **Calculated Delta:** -0.0750


### Mode: BULLET
- **Effective Tactics:** 25000
- **Effective Defense:** 1000
- **Effective Opening:** 1000
- **Calculated Delta:** -0.0750
✅ **VERIFIED:** Bullet Modifiers (High Tactics, Low Defense) applied.


### Mode: CHESS960
- **Effective Tactics:** 17500
- **Effective Defense:** 8500
- **Effective Opening:** 17500
- **Calculated Delta:** 0.0750
✅ **VERIFIED:** Chess 960 Modifiers (High Opening, Dynamic Tactics) applied.


## Test B: Progression Curve (Zombie Code Check)

**Scenario:** Rapid Game, Moves 1-50. Checking `K_phase` interpolation.

| Move | Phase | K_phase | Check |
|---|---|---|---|
| 1 | Opening | 0.2500 | Init |
| 5 | Opening | 0.2944 | Growing |
| 10 | Opening | 0.3500 | Growing |
| 11 | Midgame | 0.3500 | Static |
| 20 | Midgame | 0.4684 | Growing |
| 30 | Midgame | 0.6000 | Growing |
| 31 | Endgame | 0.6000 | Static |
| 40 | Endgame | 0.7421 | Growing |
| 50 | Endgame | 0.9000 | Growing |

**Observation:** We expect to see K_phase values changing at every checkpoint within the phases.
