# Idle Chess Manager

An incremental strategy game managed by React state and automated simulation. Players manage their chess study, upgrade stats, unlock skills, and compete in a "Gauntlet" style tournament system to climb the ranks.

## The Mathematics (Source of Truth)

This section documents the exact formulas used in the game's code.

### 1. Game Economy

*   **Passive Income (Study Time):**
    *   **Formula:** `((1 + TotalTournamentWins) * (1.01 ^ TotalTiersCleared)) / 60` per second.
    *   **Components:**
        *   `TotalTournamentWins`: Sum of Tournament Indices reached across all game modes.
        *   `TotalTiersCleared`: Sum of cumulative Tiers cleared across all game modes (including those in completed tournaments).
    *   **Multipliers:** Puzzle Multiplier (1.01^PuzzlesSolved) is applied on top of this base rate.
    *   **Usage:** Study Time is the primary currency for upgrading stats.

*   **Match Rewards:**
    *   **Standard Match Win:** Grants **1 minute** worth of current production.
    *   **Tier Clear (Match 3):** Grants **1 minute** (Standard) + **10 minutes** (Bonus) = 11 minutes worth of current production.

*   **Upgrade Costs:**
    *   **Base Formula:** `1 * (1.1 ^ (Level - 1))`.
    *   **Level Spikes:** At every 100th level (100, 200, 300...), the cost is multiplied by **5** (Standard Stats).
    *   **The Wall (Sacrifice Stat):** The 'Sacrifice' stat follows a special rule. Every 50 levels, the cost multiplier permanently increases by **1000x** (cumulative). This acts as a soft-cap/gatekeeper mechanic.
        *   Tiers: 0-49 (1x), 50-99 (1,000x), 100-149 (1,000,000x), etc.
    *   **Discounts:** *Prep Files* skill reduces 'Opening' stat cost by 20%.

*   **Offline Gain:**
    *   **Formula:** `PassiveIncomePerSecond * SecondsOffline`.
    *   **Constraints:** Minimum 60 seconds, Maximum 24 hours.

### 2. Combat System

Matches are simulated move-by-move (50 moves max). The outcome is determined by comparing "Effective Power" derived from stats, game mode modifiers, and skills.

#### Game Modes & Modifiers

*   **Rapid (Standard):** No modifiers.
*   **Blitz:**
    *   **Instincts Boost:** Tactics & Sacrifices stats are multiplied by **1.8x**.
    *   **Theory Nerf:** Opening, Midgame, and Endgame stats are multiplied by **0.6x**.
*   **Classical:**
    *   **Theory Boost:** Opening, Midgame, and Endgame stats are multiplied by **1.5x**.
    *   **Defense Boost:** Defense stat is multiplied by **1.5x**.
    *   **Instincts Nerf:** Tactics & Sacrifices stats are multiplied by **0.6x**.

#### Phases & Calculation

The combat engine uses a **Hybrid Continuous Magnitude + Probabilistic Initiative** model.

**1. Phase Configuration**
*   **Opening (Moves 1-10):** K_phase scales from 0.25 to 0.35, MaxClamp scales from 0.30 to 0.45. `BaseSum = Opening + (Tactics * 0.2)`.
*   **Midgame (Moves 11-30):** K_phase scales from 0.35 to 0.60, MaxClamp scales from 0.45 to 0.75. `BaseSum = Midgame + (Tactics * 0.8)`.
*   **Endgame (Moves 31-50):** K_phase scales from 0.60 to 0.90, MaxClamp scales from 0.75 to 1.0. `BaseSum = Endgame + (Tactics * 1.5)`.

**2. The Algorithm**
*   **Stats to Efficiency:** `PlayerEff` and `EnemyEff` are derived from the Phase's BaseSum logic (Game Mode weights and Skill Power modifiers apply here).
*   **Step A (Ratio):** `r = Math.log(PlayerEff / EnemyEff)`.
*   **Step B (Magnitude):** How much the evaluation changes.
    *   `adv = Math.tanh(abs(r) / S)` where `S = 0.15`.
    *   `rawMag = minProg + (1.0 - minProg) * adv^gamma` where `gamma = 1.6`, `minProg = 0.30`.
    *   `deltaMag = K_phase * rawMag`.
*   **Step C (Direction):** Who wins the turn (Probabilistic).
    *   `p = 1 / (1 + exp(-a * r))` where `a = 6.0`.
    *   `Sign` is determined by a random roll against `p`.
*   **Step D (Final Delta):** `Clamped(Sign * deltaMag)`.

**3. Momentum Swings**
*   **Sacrifices:** The *only* source of massive momentum swings beyond the clamped delta. Sacrifice logic (2% chance) is added to the calculated delta.
*   **Snowball:** In Endgame, if `abs(Eval) > 1.0`, the advantage grows by 10% per turn.

#### Special Mechanics

*   **Sacrifice (Gambit):**
    *   After Move 5, there is a **2% chance** per turn to trigger a Sacrifice.
    *   **Success:** If `Random(0, 100) < (SacrificeLevel * 0.2)`, result is **+5.0 Eval**.
    *   **Failure:** Result is **-2.0 Eval**.
    *   **Cap:** Sacrifice chance effectively caps at Level 500 (100% success rate).

*   **Endgame Snowball:**
    *   From Move 41+, if `abs(Eval) > 1.0`, the advantage is multiplied by **1.1x** per turn. This prevents stalemates in lopsided games.

*   **Tie-Breakers:**
    *   **Move 50 Limit:** If no checkmate occurs by Move 50, the side with the higher **Tactical Superiority** (Tactics + Sacrifices) wins.
    *   **True Draw:** If stats are identical, the game is drawn.

### 3. Progression (The Gauntlet)

*   **Structure:**
    *   **20 Tournaments:** From "School Championship" to "Simulator Full Force".
    *   **10 Tiers** per Tournament.
    *   **3 Matches** per Tier.
    *   **Advancement:** Winning Match 3 clears the Tier. Clearing Tier 10 unlocks the next Tournament.

*   **Opponent Generation:**
    *   **Base Elo:** Interpolated between Tournament Min and Max Elo based on Tier (0-9).
    *   **Match Multipliers:**
        *   Match 1: 1.00x
        *   Match 2: 1.02x
        *   Match 3 (Boss): 1.05x
    *   **Stat Distribution:**
        *   **Budget:** `Floor(TargetElo * 1.35)`.
        *   **Strategy:** Bulk distribution for main stats, followed by a random distribution loop for the last 1000 points (Buffer).
        *   **Smart Overflow:** If an opponent's Sacrifice stat exceeds 500 (Hard Cap), the excess is intelligently redistributed to their highest other stat.

### 4. Skills

Skills are purchased with Ability Points (AP) and modify the simulation logic.

*   **Opening:**
    *   *Book Worm:* 1.5x Reward if win < 20 moves.
    *   *Prep Files:* -20% Opening upgrade cost.
    *   *Psychological Edge:* Enemy Power -5% in Midgame if Phase 1 won.
    *   *Main Line:* +10% Power if Opening Level >= 100.
    *   *Gambiteer:* +20% Tactics Power, start with -0.5 Eval.
*   **Midgame:**
    *   *Counter-Play:* +15% Power if losing at Move 11.
    *   *Knight Outpost:* +10% Flat Midgame Power.
    *   *Complex Positions:* Increases Random Variance (0.85-1.15).
    *   *Tempo Gain:* Enemy Power 0.5x at Move 25.
    *   *Battery Attack:* +10% Power if Phase 1 won.
    *   *Positional Squeeze:* Winning moves gain +10% effectiveness.
*   **Sacrifices:**
    *   *Sound Sacrifice:* Failed sacrifices deal half damage.
    *   *Tal's Spirit:* Max sacrifice roll +3.5.
    *   *Desperado:* Double effectiveness if losing badly (<-3.0).
    *   *Greek Gift:* 30% chance for +2.0 Eval at Move 20.
    *   *Chaos Theory:* Scaling swing based on Enemy Tier.
*   **Tactics:**
    *   *Calculation:* +5% Tactics Power.
    *   *Pin:* 20% chance to negate enemy move in Midgame.
    *   *Fork:* +0.1 bonus to winning moves.
    *   *Mate Net:* Win threshold reduced to 6.0 (from 8.0).
*   **Endgame:**
    *   *Fortress:* 40% Draw chance if losing (-2 to -5).
    *   *Tablebase:* Enemy plays perfectly (no random) if player winning > 1.0 at Move 40.
    *   *Zugzwang:* Enemy Power -1% cumulatively per turn.
    *   *Lucena/Philidor:* Bar moves +/- 5% faster/slower based on state.

## Technical Implementation

*   **Framework:** React + Vite + Tailwind CSS.
*   **State Management:** `useGameState` custom hook with independent state slices.
*   **Persistence:**
    *   **Lazy Initialization:** State is hydrated from `localStorage` (`chess-career-save`) on first render.
    *   **Hybrid Saving:**
        *   **Auto-Save:** Interval (30s).
        *   **Force-Save:** On critical actions (Start Match, Buy Skill).
        *   **Emergency Save:** On `beforeunload`.
    *   **Performance:** High-frequency passive ticks do *not* trigger storage writes.
