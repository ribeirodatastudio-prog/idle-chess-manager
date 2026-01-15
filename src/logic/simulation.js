import { STATS } from './math.js';
import { getOpponentIdentity } from './identity.js';
import { TOURNAMENT_CONFIG } from './tournaments.js';

export const PHASES = {
  OPENING: { start: 1, end: 10, name: 'Opening' },
  MIDGAME: { start: 11, end: 30, name: 'Midgame' },
  ENDGAME: { start: 31, end: 50, name: 'Endgame' }
};

const getRandom = (min, max) => Math.random() * (max - min) + min;

export const applyModeWeights = (stats, mode) => {
    // Clone stats to avoid mutation
    const s = { ...stats };

    // Default weights (Rapid)
    let theoryWeight = 1.0;
    let instinctWeight = 1.0;

    if (mode === 'classical') {
        theoryWeight = 1.5;
        instinctWeight = 0.6;
        s.defense *= 1.5;
    } else if (mode === 'blitz') {
        theoryWeight = 0.6;
        instinctWeight = 1.8;
    } else if (mode === 'bullet') {
        // Bullet: Chaos. Tactics x2.5, Sacrifices x0.1 (Power), Others x0.1
        s.tactics *= 2.5;
        s.sacrifices *= 0.1;
        s.opening *= 0.1;
        s.midgame *= 0.1;
        s.endgame *= 0.1;
        s.defense *= 0.1;

        return s; // Early return as logic differs from standard weights
    } else if (mode === 'chess960') {
        s.opening *= 1.75;
        s.defense *= 0.85;
    }

    // Apply weights
    s.opening *= theoryWeight;
    s.midgame *= theoryWeight;
    s.endgame *= theoryWeight;

    s.tactics *= instinctWeight;
    s.sacrifices *= instinctWeight;

    return s;
};

export const generateOpponentStats = (rankData) => {
  let tournamentIndex = 0;
  let tierIndex = 0;
  let matchIndex = 0;

  if (typeof rankData === 'number') {
      // Legacy / Fallback
      const wins = rankData;
      tierIndex = Math.min(Math.floor(wins / 10), 9);
      matchIndex = wins % 3;
  } else if (rankData) {
      tournamentIndex = rankData.tournamentIndex || 0;
      tierIndex = rankData.tierIndex || 0;
      matchIndex = rankData.matchIndex || 0;
  }

  const config = TOURNAMENT_CONFIG[tournamentIndex] || TOURNAMENT_CONFIG[0];

  // Interpolate Base Elo
  // Tier 0 -> minElo. Tier 9 -> maxElo.
  const denominator = 9;
  const progress = Math.min(tierIndex / denominator, 1.0);

  const baseElo = config.minElo + ((config.maxElo - config.minElo) * progress);

  // Match Multiplier
  let multiplier = 1.0;
  if (matchIndex === 1) multiplier = 1.02;
  if (matchIndex === 2) multiplier = 1.05;

  const targetElo = Math.floor(baseElo * multiplier);

  // Total Stats Sum = Elo * 1.35 (Budget Increase)
  let totalStats = Math.floor(targetElo * 1.35);
  
  // Ensure minimum stats
  const numStats = STATS.length;
  if (totalStats < numStats) totalStats = numStats;

  // Distribute Stats
  const stats = {
    opening: 1,
    midgame: 1,
    endgame: 1,
    tactics: 1,
    sacrifices: 1,
    defense: 1
  };
  
  let remainingPoints = totalStats - numStats;
  
  // Optimization: Bulk Distribution for large numbers
  // Reserve a buffer for randomness to ensure 'Identity' logic still works
  const BUFFER = 1000;

  if (remainingPoints > BUFFER) {
      const bulkPoints = remainingPoints - BUFFER;
      const perStat = Math.floor(bulkPoints / numStats);

      if (perStat > 0) {
          STATS.forEach(key => {
              stats[key] += perStat;
          });
          remainingPoints -= (perStat * numStats);
      }
  }

  // Random Distribution (Remaining Buffer)
  while (remainingPoints > 0) {
    const randomStat = STATS[Math.floor(Math.random() * numStats)];
    stats[randomStat]++;
    remainingPoints--;
  }

  // Smart Overflow Redistribution (Sacrifice Cap > 500)
  if (stats.sacrifices > 500) {
      const overflow = stats.sacrifices - 500;
      stats.sacrifices = 500;

      // Find highest stat (excluding sacrifices) to dump overflow
      let maxVal = -1;
      let maxKey = '';

      STATS.forEach(key => {
          if (key === 'sacrifices') return;
          if (stats[key] > maxVal) {
              maxVal = stats[key];
              maxKey = key;
          }
      });

      // If found (should always be true unless all others are 0?), add overflow
      if (maxKey) {
          stats[maxKey] += overflow;
      }
  }

  // Identity
  const identity = getOpponentIdentity(stats);
  
  return {
      stats,
      totalPower: targetElo,
      rawStatsSum: totalStats,
      tier: tierIndex + 1, // Display 1-10
      currentOpponent: matchIndex + 1, // Display 1-3
      tournamentName: config.name,
      identity
  };
};

export const calculateMove = (moveNumber, rawPlayerStats, rawEnemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0, mode = 'rapid', sacrificesCount = 0) => {
  // Apply Mode Weights first
  const playerStats = applyModeWeights(rawPlayerStats, mode);
  const enemyStats = applyModeWeights(rawEnemyStats, mode);

  // Chess 960: Dynamic Tactics
  if (mode === 'chess960') {
      let tacticMult = 1.0;
      if (moveNumber <= 10) tacticMult = 1.75; // Chaos phase
      else if (moveNumber <= 30) tacticMult = 1.25; // Stabilizing
      else tacticMult = 1.0; // Pure chess

      playerStats.tactics *= tacticMult;
      enemyStats.tactics *= tacticMult;
  }

  let phase = '';
  let playerBaseSum = 0;
  let enemyBaseSum = 0;
  let logMessage = '';
  
  // Determine Phase and Relevant Stats
  if (moveNumber <= PHASES.OPENING.end) {
    phase = PHASES.OPENING.name;
    
    playerBaseSum = playerStats.opening + (playerStats.tactics * 0.2);
    enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);
    
  } else if (moveNumber <= PHASES.MIDGAME.end) {
    phase = PHASES.MIDGAME.name;
    
    playerBaseSum = playerStats.midgame + (playerStats.tactics * 0.8);
    enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);

  } else {
    phase = PHASES.ENDGAME.name;
    
    playerBaseSum = playerStats.endgame + (playerStats.tactics * 1.5);
    enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);
  }

  // --- NEW SKILL LOGIC ---

  // Skill: Deep Blue Calculation
  // Player Power scales exponentially (1.02 ^ MoveNumber)
  if (skills.deep_blue) {
      playerBaseSum *= Math.pow(1.02, moveNumber);
  }

  // Skill: Iron Curtain
  // -50% Attack, +40% Defense
  if (skills.iron_curtain) {
      playerBaseSum *= 0.5;
  }

  // Skill: Time Trouble
  // Cumulative enemy debuff in late game (Moves 35+).
  if (skills.time_trouble && moveNumber > 35) {
      const dropOff = 1 - (0.04 * (moveNumber - 35));
      // Ensure it doesn't go negative or too low?
      // Assuming math is correct: at move 60 (25 moves later), 1 - 1 = 0.
      enemyBaseSum *= Math.max(0, dropOff);
  }

  // --- END NEW SKILL LOGIC (Part 1: Base Stats) ---
  
  // Power Calculation: (Sum * 0.5) * Random
  let minR = 0.95, maxR = 1.05;
  
  const rawPlayerAttack = (playerBaseSum * 0.5) * getRandom(minR, maxR);
  const rawEnemyAttack = (enemyBaseSum * 0.5) * getRandom(minR, maxR);

  // Mitigation Logic (Defense)
  // Effective Damage = Max(Raw * 0.2, Raw - Defense*0.5)
  // Defense defaults to 1 if missing
  let playerDefense = playerStats.defense || 1;
  const enemyDefense = enemyStats.defense || 1;

  if (skills.iron_curtain) {
      playerDefense *= 1.4;
  }

  const playerMitigation = playerDefense * 0.5;
  const enemyMitigation = enemyDefense * 0.5;

  const playerEffective = Math.max(rawPlayerAttack * 0.2, rawPlayerAttack - enemyMitigation);
  const enemyEffective = Math.max(rawEnemyAttack * 0.2, rawEnemyAttack - playerMitigation);
  
  // Dampened Delta
  let dampeningFactor = 0.1;
  
  let rawDelta = playerEffective - enemyEffective;
  let delta = rawDelta * dampeningFactor;
  
  // Sacrifice Mechanic (One-Time Gambit)
  let sacrificeSwing = 0;
  let triggeredSacrifice = false;
  let triggerBrilliantBounty = false;

  // Determine Sacrifice Limits and Chance based on Mode
  let maxSacrifices = 1;
  let sacrificeChance = 0.02; // Default (Rapid)

  if (mode === 'classical') {
      sacrificeChance = 0.01;
      maxSacrifices = 1;
  } else if (mode === 'blitz') {
      sacrificeChance = 0.05;
      maxSacrifices = 2;
  } else if (mode === 'bullet') {
      sacrificeChance = 0.10;
      maxSacrifices = 3;
  } else if (mode === 'chess960') {
      sacrificeChance = 0.01;
      maxSacrifices = 1;
  }

  if (moveNumber > 5 && sacrificesCount < maxSacrifices) {
    let initiator = null;

    // Independent triggers for Player and Enemy
    const playerRoll = Math.random();
    const enemyRoll = Math.random();

    // Player Trigger
    if (playerRoll < sacrificeChance) {
        initiator = 'player';
    }
    // Enemy Trigger (if Player didn't trigger to avoid double events per turn)
    else if (enemyRoll < sacrificeChance) {
        initiator = 'enemy';
    }

    if (initiator) {
        triggeredSacrifice = true;
        const isPlayer = initiator === 'player';
        const actorStats = isPlayer ? playerStats : enemyStats;

        // Success Check: Roll < (Level * 0.2)
        // Max Level 500 * 0.2 = 100% chance.
        const successChance = Math.min(actorStats.sacrifices * 0.2, 100);
        const roll = Math.random() * 100;
        const isSuccess = roll < successChance;

        if (isPlayer) {
            if (isSuccess) {
                sacrificeSwing = 5.0;
                logMessage = '!! BRILLIANT SACRIFICE !! The engine didn\'t see it coming!';
                if (skills.brilliant_bounty) triggerBrilliantBounty = true;
            } else {
                sacrificeSwing = -2.0;
                logMessage = 'Unsound Sacrifice... The opponent refutes it.';
            }
        } else {
            // Enemy Logic
            if (isSuccess) {
                // Enemy succeeds -> Hurts player (Delta decreases)
                sacrificeSwing = -5.0;
                logMessage = '!! OPPONENT SACRIFICE !! The AI unleashes chaos!';
            } else {
                // Enemy fails -> Helps player (Delta increases)
                sacrificeSwing = 2.0;
                logMessage = 'Opponent blunders a sacrifice!';
            }
        }

        delta += sacrificeSwing;
    }
  }
  
  // --- NEW SKILL LOGIC (Part 2: Delta Modifiers) ---

  // Skill: Lasker's Defense
  // Double evaluation recovery if losing after Move 20.
  if (skills.lasker_defense && moveNumber > 20) {
      if (currentEval < -1.0 && delta > 0) {
          delta *= 2.0;
      }
  }

  let newEval = currentEval + delta;

  // Endgame Snowball Effect: Multiplier if advantage > 1.0
  if (phase === PHASES.ENDGAME.name) {
      if (newEval > 1.0) {
          newEval *= 1.1; // 10% bonus for winning side
      } else if (newEval < -1.0) {
          newEval *= 1.1; // 10% penalty (bonus for opponent)
      }
  }
  
  // Resolution Logic
  let result = null; // 'win', 'loss', 'draw', or null (continue)
  
  // Skill: Decisive Blow
  // Win/Lose Threshold reduced to +/- 5.0
  const winThreshold = skills.decisive_blow ? 5.0 : 8.0;
  
  // 1. Check Win/Loss Bounds
  if (newEval >= winThreshold) result = 'win';
  else if (newEval <= -winThreshold) result = 'loss';
  
  // 2. Check Draw Condition A (Remis Zone)
  // Move 30 to 49, Eval between -1.0 and +1.0 -> 15% chance
  if (!result && moveNumber >= 30 && moveNumber <= 49) {
    let drawChance = 0.15;
    
    if (newEval > -1.0 && newEval < 1.0) {
      if (Math.random() < drawChance) {
        result = 'draw';
        logMessage = 'Draw agreed in deadlocked position.';
      }
    }
  }
  
  // 3. Check Draw Condition B (Move 50 Limit) with Tie-Breaker
  if (!result && moveNumber >= 50) {
    // Skill: Iron Curtain (Win Condition)
    // Survival at Move 50 counts as a WIN if Eval > -8.0 (and not already lost by threshold)
    // Note: If we are here, newEval > -winThreshold (e.g. -5 or -8).
    // So if Iron Curtain is active, we just need to return win.
    if (skills.iron_curtain && newEval > -8.0) {
        result = 'win';
        logMessage = 'Iron Curtain! Survival is Victory.';
    } else {
        // Standard Tie-Breaker
        const playerAggression = playerStats.tactics + playerStats.sacrifices;
        const enemyAggression = enemyStats.tactics + enemyStats.sacrifices;

        if (playerAggression > enemyAggression) {
            result = 'win';
            logMessage = 'Draw avoided! Player wins by Tactical Superiority.';
        } else if (enemyAggression > playerAggression) {
            result = 'loss';
            logMessage = 'Draw avoided! Opponent wins by Tactical Superiority.';
        } else {
            // True Draw
            result = 'draw';
            logMessage = 'Game drawn by move limit (50). Stats identical.';
        }
    }
  }
  
  return {
    delta,
    newEval,
    result,
    phase,
    sacrificeSwing,
    logMessage,
    sacrificesCount: triggeredSacrifice ? sacrificesCount + 1 : sacrificesCount,
    hasSacrificed: triggeredSacrifice
  };
};
