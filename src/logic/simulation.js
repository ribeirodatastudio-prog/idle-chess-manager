import { STATS } from './math.js';
import { getOpponentIdentity } from './identity.js';
import { TOURNAMENT_CONFIG } from './tournaments.js';

export const PHASES = {
  OPENING: { start: 1, end: 10, name: 'Opening' },
  MIDGAME: { start: 11, end: 30, name: 'Midgame' },
  ENDGAME: { start: 31, end: 50, name: 'Endgame' }
};

const getRandom = (min, max) => Math.random() * (max - min) + min;
const lerp = (start, end, t) => start + (end - start) * t;

// Box-Muller transform for normal distribution
const randomNormal = (mean, stdDev) => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return num * stdDev + mean;
};

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

  // Optimization: Use Normal Approximation for large buffers (>50)
  // This avoids O(N) loop (approx 1000 iterations) and replaces it with O(STATS) logic.
  if (remainingPoints > 50) {
      for (let i = 0; i < numStats - 1; i++) {
          if (remainingPoints <= 0) break;

          const key = STATS[i];
          const p = 1.0 / (numStats - i);

          // Multinomial approximation using Normal distribution
          const mean = remainingPoints * p;
          const stdDev = Math.sqrt(remainingPoints * p * (1.0 - p));

          let val = Math.round(randomNormal(mean, stdDev));

          // Clamp to ensure validity
          val = Math.max(0, Math.min(remainingPoints, val));

          stats[key] += val;
          remainingPoints -= val;
      }

      // Assign remainder to the last stat
      if (remainingPoints > 0) {
          stats[STATS[numStats - 1]] += remainingPoints;
          remainingPoints = 0;
      }
  }

  // Fallback: Standard Random Distribution (Small Buffer)
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

const getSkillLevel = (skills, id) => {
    const val = skills[id];
    if (typeof val === 'number') return val;
    return val ? 1 : 0;
};

export const calculateMove = (moveNumber, rawPlayerStats, rawEnemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0, mode = 'rapid', sacrificesCount = 0) => {
  // --- PREPARATION & WEIGHTS ---
  const playerStats = applyModeWeights(rawPlayerStats, mode);
  const enemyStats = applyModeWeights(rawEnemyStats, mode);

  // --- SKILL MODIFIERS (STATS) ---
  if (skills.study_opening) playerStats.opening *= 1.1;
  if (skills.study_midgame) playerStats.midgame *= 1.1;
  if (skills.study_endgame) playerStats.endgame *= 1.1;

  if (skills.instinct_tactics) playerStats.tactics *= 1.1;
  if (skills.instinct_defense) playerStats.defense *= 1.1;

  // Chess 960: Dynamic Tactics
  if (mode === 'chess960') {
      let tacticMult = 1.0;
      if (moveNumber <= 10) tacticMult = 1.75; // Chaos phase
      else if (moveNumber <= 30) tacticMult = 1.25; // Stabilizing
      else tacticMult = 1.0; // Pure chess

      playerStats.tactics *= tacticMult;
      enemyStats.tactics *= tacticMult;
  }

  // --- PHASE DETERMINATION & BASE SUMS ---
  let phase = '';
  let playerBaseSum = 0;
  let enemyBaseSum = 0;
  let logMessage = '';

  // Define K_phase and MaxClamp dynamically
  let K_phase = 0.25;
  let MaxClamp = 0.30;
  
  if (moveNumber <= PHASES.OPENING.end) {
    phase = PHASES.OPENING.name;
    
    // Phase Mastery Modifiers
    const defLvl = getSkillLevel(skills, 'op_def_master');
    const tacLvl = getSkillLevel(skills, 'op_tac_master');

    if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
    if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

    // Instinct Focus Modifiers
    const instDefLvl = getSkillLevel(skills, 'inst_def_op');
    const instTacLvl = getSkillLevel(skills, 'inst_tac_op');

    if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
    if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));

    // Stats
    playerBaseSum = playerStats.opening + (playerStats.tactics * 0.2);
    enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);

    // Dynamic Interpolation
    const pStart = PHASES.OPENING.start;
    const pEnd = PHASES.OPENING.end;
    const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));

    K_phase = lerp(0.25, 0.35, progress);
    MaxClamp = lerp(0.30, 0.45, progress);
    
  } else if (moveNumber <= PHASES.MIDGAME.end) {
    phase = PHASES.MIDGAME.name;
    
    // Phase Mastery Modifiers
    const defLvl = getSkillLevel(skills, 'mid_def_master');
    const tacLvl = getSkillLevel(skills, 'mid_tac_master');

    if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
    if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

    // Instinct Focus Modifiers
    const instDefLvl = getSkillLevel(skills, 'inst_def_mid');
    const instTacLvl = getSkillLevel(skills, 'inst_tac_mid');

    if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
    if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));

    // Stats
    playerBaseSum = playerStats.midgame + (playerStats.tactics * 0.8);
    enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);

    // Dynamic Interpolation
    const pStart = PHASES.MIDGAME.start;
    const pEnd = PHASES.MIDGAME.end;
    const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));

    K_phase = lerp(0.35, 0.60, progress);
    MaxClamp = lerp(0.45, 0.75, progress);

  } else {
    phase = PHASES.ENDGAME.name;

    // Phase Mastery Modifiers
    const defLvl = getSkillLevel(skills, 'end_def_master');
    const tacLvl = getSkillLevel(skills, 'end_tac_master');

    if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
    if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

    // Instinct Focus Modifiers
    const instDefLvl = getSkillLevel(skills, 'inst_def_end');
    const instTacLvl = getSkillLevel(skills, 'inst_tac_end');

    if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
    if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));
    
    // Stats
    playerBaseSum = playerStats.endgame + (playerStats.tactics * 1.5);
    enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);

    // Dynamic Interpolation
    const pStart = PHASES.ENDGAME.start;
    const pEnd = PHASES.ENDGAME.end;
    const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));

    K_phase = lerp(0.60, 0.90, progress);
    MaxClamp = lerp(0.75, 1.0, progress);
  }

  // --- SKILL MODIFIERS (BASE STATS) ---

  // Skill: Deep Blue Calculation
  // Player Power scales exponentially (1.02 ^ MoveNumber)
  if (skills.deep_blue) {
      playerBaseSum *= Math.pow(1.02, moveNumber);
  }

  // Skill: Iron Curtain (Attack Reduction)
  // -50% Attack
  if (skills.iron_curtain) {
      playerBaseSum *= 0.5;
  }

  // Skill: Time Trouble
  // Cumulative enemy debuff in late game (Moves 35+).
  if (skills.time_trouble && moveNumber > 35) {
      const dropOff = 1 - (0.04 * (moveNumber - 35));
      enemyBaseSum *= Math.max(0, dropOff);
  }

  // --- END NEW SKILL LOGIC (Part 1: Base Stats) ---
  
  // --- HYBRID PROBABILISTIC COMBAT ENGINE ---

  // 1. Constants & Parameters
  const S = 0.15;
  const a = 6.0;
  const gamma = 1.6;
  const minProg = 0.30;

  // 3. The Algorithm

  // Step A: Base Ratio (Logarithmic)
  // Use BaseSums as 'Eff' (Efficiency/Power)
  // Ensure stats are at least 1.0 to avoid Math.log(0) -> -Infinity
  let PlayerEff = Math.max(1.0, playerBaseSum);
  let EnemyEff = Math.max(1.0, enemyBaseSum);

  // Skill: Iron Curtain (Defense Boost part)
  // The attack reduction (-50%) is handled in Base Stats.
  // The defense boost (+40%) is mapped here as reducing Enemy Efficiency.
  if (skills.iron_curtain) {
      EnemyEff /= 1.4;
  }

  const r = Math.log(PlayerEff / EnemyEff);

  // Step B: Continuous Magnitude (How big is the move?)
  const adv = Math.tanh(Math.abs(r) / S);
  const rawMag = minProg + (1.0 - minProg) * Math.pow(adv, gamma);
  const deltaMag = K_phase * rawMag;

  // Step C: Probabilistic Direction (Who wins the move?)
  // p = Probability that Player wins this move
  const p = 1 / (1 + Math.exp(-a * r));
  
  // Roll the dice
  const isPlayerWinner = Math.random() < p;
  const sign = isPlayerWinner ? 1 : -1;

  // Step D: Final Calculation & Clamping

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
  // Random Variance (0.9 to 1.1) for organic feel
  const variance = 0.9 + Math.random() * 0.2;
  const finalDelta = sign * deltaMag * efficiency * variance;
  
  // Clamp the base move delta (before sacrifices/skills)
  let delta = Math.max(-MaxClamp, Math.min(MaxClamp, finalDelta));
  
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

  // --- SKILL MODIFIERS (SACRIFICE CHANCE) ---
  if (skills.instinct_risk) sacrificeChance *= 1.1;
  if (skills.chaos_theory) sacrificeChance *= 2.0;

  // Phase Mastery Sacrifice Modifiers
  if (moveNumber <= PHASES.OPENING.end) {
      const sacLvl = getSkillLevel(skills, 'op_sac_master');
      if (sacLvl > 0) sacrificeChance += (0.01 * sacLvl);

      const instSacLvl = getSkillLevel(skills, 'inst_sac_op');
      if (instSacLvl > 0) sacrificeChance += (0.01 * instSacLvl);
  } else if (moveNumber <= PHASES.MIDGAME.end) {
      const sacLvl = getSkillLevel(skills, 'mid_sac_master');
      if (sacLvl > 0) sacrificeChance += (0.01 * sacLvl);

      const instSacLvl = getSkillLevel(skills, 'inst_sac_mid');
      if (instSacLvl > 0) sacrificeChance += (0.01 * instSacLvl);
  } else {
      const sacLvl = getSkillLevel(skills, 'end_sac_master');
      if (sacLvl > 0) sacrificeChance += (0.01 * sacLvl);

      const instSacLvl = getSkillLevel(skills, 'inst_sac_end');
      if (instSacLvl > 0) sacrificeChance += (0.01 * instSacLvl);
  }

  if (moveNumber > 5 && sacrificesCount < maxSacrifices) {
    let initiator = null;
    const playerRoll = Math.random();
    const enemyRoll = Math.random();

    if (playerRoll < sacrificeChance) {
        initiator = 'player';
    } else if (enemyRoll < sacrificeChance) {
        initiator = 'enemy';
    }

    if (initiator) {
        triggeredSacrifice = true;
        const isPlayer = initiator === 'player';
        const actorStats = isPlayer ? playerStats : enemyStats;

        // Success Check: Roll < (Level * 0.2)
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
            if (isSuccess) {
                sacrificeSwing = -5.0;
                logMessage = '!! OPPONENT SACRIFICE !! The AI unleashes chaos!';
            } else {
                sacrificeSwing = 2.0;
                logMessage = 'Opponent blunders a sacrifice!';
            }
        }
        delta += sacrificeSwing;
    }
  }
  
  // --- SKILL MODIFIERS (RESULT) ---

  // Skill: Lasker's Defense
  // Double evaluation recovery if losing after Move 20.
  if (skills.lasker_defense && moveNumber > 20) {
      if (currentEval < -1.0 && delta > 0) {
          delta *= 2.0;
      }
  }

  let newEval = currentEval + delta;

  // Endgame Snowball Effect
  if (phase === PHASES.ENDGAME.name) {
      if (newEval > 1.0) {
          newEval *= 1.1;
      } else if (newEval < -1.0) {
          newEval *= 1.1;
      }
  }
  
  // --- RESOLUTION ---

  let result = null;
  
  // Skill: Decisive Blow
  const winThreshold = skills.decisive_blow ? 5.0 : 8.0;
  
  // 1. Check Win/Loss
  if (newEval >= winThreshold) result = 'win';
  else if (newEval <= -winThreshold) result = 'loss';
  
  // 2. Check Draw A (Remis Zone 30-49)
  if (!result && moveNumber >= 30 && moveNumber <= 49) {
    if (newEval > -1.0 && newEval < 1.0) {
      if (Math.random() < 0.15) {
        result = 'draw';
        logMessage = 'Draw agreed in deadlocked position.';
      }
    }
  }
  
  // 3. Check Draw B (Move 50 Limit)
  if (!result && moveNumber >= 50) {
    if (skills.iron_curtain && newEval > -8.0) {
        result = 'win';
        logMessage = 'Iron Curtain! Survival is Victory.';
    } else {
        const playerAggression = playerStats.tactics + playerStats.sacrifices;
        const enemyAggression = enemyStats.tactics + enemyStats.sacrifices;

        if (playerAggression > enemyAggression) {
            result = 'win';
            logMessage = 'Draw avoided! Player wins by Tactical Superiority.';
        } else if (enemyAggression > playerAggression) {
            result = 'loss';
            logMessage = 'Draw avoided! Opponent wins by Tactical Superiority.';
        } else {
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
    hasSacrificed: triggeredSacrifice,
    triggerBrilliantBounty,
    effectivePlayerStats: playerStats,
    effectiveEnemyStats: enemyStats,
    K_phase
  };
};
