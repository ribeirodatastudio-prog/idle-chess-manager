# Idle Chess Manager

An incremental strategy game managed by React state and automated simulation. Players manage their chess study, upgrade stats, unlock skills, and compete in tournaments to climb the ranks.

## The Mathematics (Source of Truth)

This section documents the exact formulas used in the game's code.

### 1. Resources & Income

*   **Passive Income (Study Time):**
    *   Formula: `((1 + wins) * (1.1 ^ wins)) / 60` per second.
    *   This calculates the study time generated per second based on the number of tournament wins.

*   **Offline Gain:**
    *   Formula: `PassiveIncomePerSecond * SecondsOffline`.
    *   Calculated immediately upon loading the game if a previous save exists.

### 2. Stats & Upgrades

*   **Stat Power:**
    *   Formula: `Level * 0.5`.
    *   Each level in a stat (Opening, Midgame, Endgame, Tactics, Sacrifices) contributes 0.5 to the base power calculation.

*   **Upgrade Costs:**
    *   **Base Formula:** `1 * (1.1 ^ (Level - 1))`.
    *   **Level Spikes:** At every 100th level (100, 200, 300...), the cost is multiplied by **5**.
    *   **Discounts:**
        *   If the **Prep Files** skill is owned, the cost for the **Opening** stat is multiplied by **0.8**.

*   **Ability Points (AP):**
    *   Formula: `floor((PlayerElo - 100) / 300) + floor(Wins / 10)`.
    *   AP is used to purchase skills.

### 3. Tournament Scaling (Gauntlet System)

*   **Structure:**
    *   **20 Unique Tournaments:** Ranging from "School Championship" (600 Elo) to "Simulator Full Force" (1 Billion Elo).
    *   **Tiers:** Each Tournament has **10 Tiers**.
    *   **Matches:** Each Tier consists of **3 Matches**.
    *   **Progression:** Win 3 Matches to advance a Tier. Complete 10 Tiers to advance to the next Tournament.

*   **Opponent Stats:**
    *   **Base Elo:** Interpolated between the Tournament's Min and Max Elo based on the current Tier.
    *   **Match Multiplier:**
        *   Match 1: 1.00x
        *   Match 2: 1.02x
        *   Match 3: 1.05x
    *   **Total Power:** `OpponentElo - 100`.

*   **Tournament Rewards:**
    *   **Base Reward:** `CurrentIncomePerSecond * 600` (Equivalent to 10 minutes of passive income).
    *   **Bonus:** If the **Book Worm** skill is owned and the match is won in **< 20 moves**, the reward is multiplied by **1.5**.

## Simulation Engine

Matches are simulated move-by-move. The outcome is determined by comparing "Power" values derived from stats and skills.

### Phases & Logic

1.  **Opening (Moves 1-10)**
    *   **Base Power:** `OpeningStat + (TacticsStat * 0.2)`.
    *   **Skills:** *Main Line* (Opening >= 100 -> +10%), *Gambiteer* (+20% Tactics).

2.  **Midgame (Moves 11-30)**
    *   **Base Power:** `MidgameStat + (TacticsStat * 0.8)`.
    *   **Skills:** *Battery Attack* (+10% if Phase 1 Won), *Counter-Play* (+15% if losing at Move 11), *Knight Outpost* (+10%).
    *   **Sacrifice Mechanic:** In this phase, a "Sacrifice Swing" is calculated (based on Sacrifices stat) adding volatility to the evaluation.

3.  **Endgame (Moves 31-50)**
    *   **Base Power:** `EndgameStat + (TacticsStat * 1.5)`.
    *   **Skills:** *Zugzwang* (Reduces enemy power by 1% cumulatively per move).

### Evaluation & Outcome

*   **Move Calculation:**
    *   `PlayerPower = (PlayerBaseSum * 0.5) * Random(0.95, 1.05)`
    *   `EnemyPower = (EnemyBaseSum * 0.5) * Random(0.95, 1.05)`
    *   `Delta = (PlayerPower - EnemyPower) * 0.1`
    *   `NewEval = CurrentEval + Delta`

*   **Win Conditions:**
    *   **Win:** `Eval >= 8.0` (or `6.0` if *Mate Net* skill is owned).
    *   **Loss:** `Eval <= -8.0`.

*   **Endgame Snowball:**
    *   In the Endgame phase (Moves 31+), if a side has an advantage (`abs(Eval) > 1.0`), their advantage is multiplied by **1.1x** (10%) per turn. This prevents long, drawn-out endgames by forcing a decisive result.

*   **Draw Conditions:**
    *   **Deadlock:** Between Move 30-49, if Eval is between `-1.0` and `1.0`, there is a **15% chance** per turn to draw. (40% chance if *Fortress* skill is active and Eval is between `-5.0` and `-2.0`).
    *   **Move Limit & Tie-Breaker:** If Move 50 is reached without a result:
        *   **Tie-Breaker:** The side with the higher total **Tactics + Sacrifices** wins.
        *   **Draw:** If stats are identical, the game ends in a Draw.

## Technical & Setup

*   **Stack:** React + Tailwind CSS (Vite).
*   **State Management:** Custom Hook (`useGameState`).

### Persistence Implementation

The game uses a **Lazy Initialization** pattern with **Hybrid Saving** to ensure data integrity and performance.

*   **Lazy Initialization:** State hooks initialize by reading `localStorage` immediately, preventing default values from overwriting saved data on refresh.
    ```javascript
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('chess-career-save');
        return saved ? JSON.parse(saved).stats : INITIAL_STATS;
    });
    ```
*   **Hybrid Saving:**
    1.  **Auto-Save:** Every 30 seconds.
    2.  **Trigger-Save:** Immediately after critical actions (Upgrade, Skill Buy, Tournament Start/End).
    3.  **Performance:** Passive resource ticks do *not* trigger saves to avoid UI lag on mobile devices.
