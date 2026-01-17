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

  // Optimization: Use Normal Approximation for large buffers (>50)
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

export const getPhaseConfig = (skills = {}) => {
  const opExtender = getSkillLevel(skills, 'op_extender');
  const midExtender = getSkillLevel(skills, 'mid_extender');
  const endExtender = getSkillLevel(skills, 'end_extender');

  const openingEnd = 10 + opExtender;
  const midgameEnd = 30 + opExtender + midExtender;
  const maxTurns = 50 + endExtender;

  return { openingEnd, midgameEnd, maxTurns };
};

// --- NEW CENTRALIZED MATH HELPER ---
export const getSnapshot = (turn, rawPlayerStats, rawEnemyStats, skills = {}, phaseConfig = null, context = {}) => {
    // 1. Context & Setup
    const { phase1Won, phase2Won, mode = 'rapid' } = context;
    const phases = phaseConfig || { openingEnd: 10, midgameEnd: 30, maxTurns: 50 };

    // 2. Determine Phase
    let phase = PHASES.OPENING.name;
    if (turn > phases.midgameEnd) phase = PHASES.ENDGAME.name;
    else if (turn > phases.openingEnd) phase = PHASES.MIDGAME.name;

    // 3. Base Stats (Mode Weights applied)
    // Note: applyModeWeights returns a CLONE, safe to mutate.
    const playerStats = applyModeWeights(rawPlayerStats, mode);
    const enemyStats = applyModeWeights(rawEnemyStats, mode);
    
    // Store Base Enemy for clamping
    const enemyBase = { ...enemyStats };

    // Debugging Setup
    let debugBreakdown = null;
    let debugStat = null;
    if (turn === 1) debugStat = 'opening';
    else if (turn === 15) debugStat = 'tactics';
    else if (turn === 35) debugStat = 'tactics';

    let debugBase = 0;
    let debugMod = 0;
    let debugFinal = 0;
    let debugEnemyFinal = 0;
    let debugDebuff = 0;

    // 4. Calculate Player Modifiers
    // We iterate over keys to apply generic additives/multipliers, then specific overrides.
    
    STATS.forEach(stat => {
        let additive = 0;
        let multiplier = 1.0;

        // --- INSTINCT FOCUS (TIER 2) - Additive ---
        if (stat === 'tactics') {
            if (phase === PHASES.OPENING.name) additive += 0.01 * getSkillLevel(skills, 'inst_tac_op');
            if (phase === PHASES.MIDGAME.name) additive += 0.01 * getSkillLevel(skills, 'inst_tac_mid');
            if (phase === PHASES.ENDGAME.name) additive += 0.01 * getSkillLevel(skills, 'inst_tac_end');
        } else if (stat === 'defense') {
            if (phase === PHASES.OPENING.name) additive += 0.01 * getSkillLevel(skills, 'inst_def_op');
            if (phase === PHASES.MIDGAME.name) additive += 0.01 * getSkillLevel(skills, 'inst_def_mid');
            if (phase === PHASES.ENDGAME.name) additive += 0.01 * getSkillLevel(skills, 'inst_def_end');
        }

        // --- MOMENTUM (TIER 3) - Additive ---
        // Space Advantage: +4% All Stats in Midgame if P1 Won
        if (phase === PHASES.MIDGAME.name && phase1Won) {
             additive += 0.04 * getSkillLevel(skills, 'op_space');
        }
        // Simplification: +4% All Stats in Endgame if P2 Won
        if (phase === PHASES.ENDGAME.name && phase2Won) {
             additive += 0.04 * getSkillLevel(skills, 'mid_simplify');
        }

        // --- PHASE MASTERY (TIER 1) - Multiplicative ---
        // Formula: 1 + (0.1 * Level)
        if (phase === PHASES.OPENING.name) {
            if (stat === 'defense') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'op_def_master'));
            if (stat === 'tactics') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'op_tac_master'));
        } else if (phase === PHASES.MIDGAME.name) {
            if (stat === 'defense') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'mid_def_master'));
            if (stat === 'tactics') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'mid_tac_master'));
        } else if (phase === PHASES.ENDGAME.name) {
            if (stat === 'defense') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'end_def_master'));
            if (stat === 'tactics') multiplier *= (1 + 0.1 * getSkillLevel(skills, 'end_tac_master'));
        }

        // --- STUDY FOCUS (ROOT) - Multiplicative ---
        if (phase === PHASES.OPENING.name && stat === 'opening' && skills.study_opening) multiplier *= 1.1;
        if (phase === PHASES.MIDGAME.name && stat === 'midgame' && skills.study_midgame) multiplier *= 1.1;
        if (phase === PHASES.ENDGAME.name && stat === 'endgame' && skills.study_endgame) multiplier *= 1.1;

        // --- INSTINCT ROOT - Multiplicative ---
        if (stat === 'tactics' && skills.instinct_tactics) multiplier *= 1.1;
        if (stat === 'defense' && skills.instinct_defense) multiplier *= 1.1;

        // --- SCALING (TIER 3) - Multiplicative ---
        if (stat === 'tactics') {
             const lvl = getSkillLevel(skills, 'inst_tac_scale');
             if (lvl > 0) multiplier *= Math.pow(1.005, turn * lvl); // Wait. Description: "x1.005 per move number per level." usually means pow(1.005, turn)^lvl ? No, pow(1.005, turn). Scale with level?
             // Usually it's pow(Base + (Gain*Lvl), Turn) or pow(Base, Turn) * Lvl?
             // Previous code: Math.pow(1 + (0.005 * tacScaleLvl), moveNumber)
             // Reverting to previous logic: pow(1 + (0.005 * Lvl), turn)
             if (lvl > 0) multiplier *= Math.pow(1 + (0.005 * lvl), turn);
        }
        if (stat === 'defense') {
             const lvl = getSkillLevel(skills, 'inst_def_scale');
             if (lvl > 0) multiplier *= Math.pow(1 + (0.005 * lvl), turn);
        }

        // --- GLOBAL SKILLS ---
        // Deep Blue: Scales exponentially
        if (skills.deep_blue) {
             multiplier *= Math.pow(1.02, turn);
        }
        // Iron Curtain: -50% Attack
        if (skills.iron_curtain) {
             multiplier *= 0.5;
        }

        // Main Line (Opening >= 100 -> +10%)
        // Original logic: "if Opening Level >= 100". Check raw stats?
        // Let's assume raw opening stat? or Base opening?
        // Using rawPlayerStats.opening.
        if (skills.main_line && rawPlayerStats.opening >= 100) {
             multiplier *= 1.1;
        }

        // Chess 960 Tactic Dynamics
        if (mode === 'chess960' && stat === 'tactics') {
            if (turn <= 10) multiplier *= 1.75;
            else if (turn <= 30) multiplier *= 1.25;
        }

        // APPLY TO PLAYER STAT
        const preVal = playerStats[stat];
        playerStats[stat] = playerStats[stat] * (1 + additive) * multiplier;

        // Capture Debug Info
        if (stat === debugStat) {
            debugBase = preVal;
            // Effective Multiplier = (1+Add) * Mult
            debugMod = (1 + additive) * multiplier;
            debugFinal = playerStats[stat];
        }
    });

    // 5. Calculate Enemy Debuffs & Clamping
    STATS.forEach(stat => {
        let debuffSum = 0; // Additive Debuffs

        // --- TIER 3 DEBUFFS ---
        if (phase === PHASES.OPENING.name && stat === 'opening') {
            debuffSum += 0.03 * getSkillLevel(skills, 'op_novelty');
        }
        if (phase === PHASES.MIDGAME.name && stat === 'tactics') {
            debuffSum += 0.03 * getSkillLevel(skills, 'mid_cloud');
        }
        if (phase === PHASES.ENDGAME.name && stat === 'defense') {
            debuffSum += 0.03 * getSkillLevel(skills, 'end_tablebase');
        }

        // --- INSTINCT DEBUFFS (TIER 2) ---
        if (stat === 'tactics') debuffSum += 0.01 * getSkillLevel(skills, 'inst_tac_deb');
        if (stat === 'defense') debuffSum += 0.01 * getSkillLevel(skills, 'inst_def_deb');
        if (stat === 'endgame') debuffSum += 0.01 * getSkillLevel(skills, 'inst_sac_deb'); // "Endgame Confusion" targets Endgame stat

        // --- SKILL: TIME TROUBLE ---
        if (skills.time_trouble && turn > 35) {
             // "Cumulative enemy debuff... 4% per turn after 35"
             // Original: 1 - 0.04 * (turn - 35).
             // Add to debuffSum?
             debuffSum += 0.04 * (turn - 35);
        }

        // --- SKILL: ZUGZWANG (Tier 3) ---
        if (stat === 'defense' || stat === 'tactics' || stat === 'opening' || stat === 'midgame' || stat === 'endgame' || stat === 'sacrifices') {
             // Applies to ALL stats? "Enemy stats decay"
             const zugLvl = getSkillLevel(skills, 'end_zugzwang');
             if (zugLvl > 0 && turn > 30) {
                 debuffSum += 0.01 * zugLvl * (turn - 30);
             }
        }

        // Apply Debuff
        // Value = Base * (1 - DebuffSum)
        let finalVal = enemyStats[stat] * (1 - debuffSum);

        // Clamp: Min 10% of Base (Mode Weighted)
        const minVal = enemyBase[stat] * 0.10;
        if (finalVal < minVal) finalVal = minVal;

        enemyStats[stat] = finalVal;

        if (stat === debugStat) {
            debugEnemyFinal = enemyStats[stat];
            debugDebuff = debuffSum;
        }
    });

    if (debugStat) {
        // "T15 (Mid): Base Tac 100 -> Mod 1.5x -> Debuff -10% -> Final 135. Enemy 120."
        const label = debugStat === 'opening' ? 'Op' : (debugStat === 'tactics' ? 'Tac' : 'Stat');
        const phaseLabel = phase.substring(0, 3);
        const modStr = debugMod.toFixed(2) + 'x';
        const debuffStr = (debugDebuff * 100).toFixed(0) + '%';

        debugBreakdown = `T${turn} (${phaseLabel}): Base ${label} ${Math.round(debugBase)} -> Mod ${modStr} -> Debuff -${debuffStr} -> Final ${Math.round(debugFinal)}. Enemy ${Math.round(debugEnemyFinal)}.`;
    }

    // 6. Calculate Sacrifice Chance
    // Base 2% (Rapid). Modifiers apply.
    let sacrificeChance = 0.02;
    let maxSacrifices = 1;

    if (mode === 'classical') { sacrificeChance = 0.01; maxSacrifices = 1; }
    else if (mode === 'blitz') { sacrificeChance = 0.05; maxSacrifices = 2; }
    else if (mode === 'bullet') { sacrificeChance = 0.10; maxSacrifices = 3; }
    else if (mode === 'chess960') { sacrificeChance = 0.01; maxSacrifices = 1; }

    let sacAdd = 0;
    let sacMult = 1.0;

    // Additive
    if (phase === PHASES.OPENING.name) {
        sacAdd += 0.01 * getSkillLevel(skills, 'op_sac_master');
        sacAdd += 0.01 * getSkillLevel(skills, 'inst_sac_op');
    } else if (phase === PHASES.MIDGAME.name) {
        sacAdd += 0.01 * getSkillLevel(skills, 'mid_sac_master');
        sacAdd += 0.01 * getSkillLevel(skills, 'inst_sac_mid');
    } else if (phase === PHASES.ENDGAME.name) {
        sacAdd += 0.01 * getSkillLevel(skills, 'end_sac_master');
        sacAdd += 0.01 * getSkillLevel(skills, 'inst_sac_end');
    }

    // Multiplier
    if (skills.instinct_risk) sacMult *= 1.1;
    if (skills.chaos_theory) sacMult *= 2.0;

    // Scaling
    const sacScaleLvl = getSkillLevel(skills, 'inst_sac_scale');
    if (sacScaleLvl > 0) sacMult *= Math.pow(1 + (0.005 * sacScaleLvl), turn);

    // Final Calc
    sacrificeChance = (sacrificeChance + sacAdd) * sacMult;

    // Cap at 90%
    if (sacrificeChance > 0.90) sacrificeChance = 0.90;

    return {
        playerStats,
        enemyStats,
        phase,
        sacrificeChance,
        maxSacrifices,
        debugBreakdown
    };
};

export const calculateMove = (moveNumber, rawPlayerStats, rawEnemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0, mode = 'rapid', sacrificesCount = 0, phaseConfig = null, phase2Won = false) => {

    // 1. Get Snapshot
    const snapshot = getSnapshot(moveNumber, rawPlayerStats, rawEnemyStats, skills, phaseConfig, { phase1Won, phase2Won, mode });
    const { playerStats, enemyStats, phase, sacrificeChance, maxSacrifices } = snapshot;

    // 2. Base Sums (Using effective stats)
    let playerBaseSum = 0;
    let enemyBaseSum = 0;
    let K_phase = 0.25;
    let MaxClamp = 0.30;

    const phases = phaseConfig || { openingEnd: 10, midgameEnd: 30, maxTurns: 50 };

    if (phase === PHASES.OPENING.name) {
        playerBaseSum = playerStats.opening + (playerStats.tactics * 0.2);
        enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);

        const pStart = 1;
        const pEnd = phases.openingEnd;
        const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));
        K_phase = lerp(0.25, 0.35, progress);
        MaxClamp = lerp(0.30, 0.45, progress);

    } else if (phase === PHASES.MIDGAME.name) {
        playerBaseSum = playerStats.midgame + (playerStats.tactics * 0.8);
        enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);

        const pStart = phases.openingEnd + 1;
        const pEnd = phases.midgameEnd;
        const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));
        K_phase = lerp(0.35, 0.60, progress);
        MaxClamp = lerp(0.45, 0.75, progress);

    } else {
        playerBaseSum = playerStats.endgame + (playerStats.tactics * 1.5);
        enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);

        const pStart = phases.midgameEnd + 1;
        const pEnd = phases.maxTurns;
        const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));
        K_phase = lerp(0.60, 0.90, progress);
        MaxClamp = lerp(0.75, 1.0, progress);
    }

    // 3. Combat Logic
    const S = 0.15;
    const a = 6.0;
    const gamma = 1.6;
    const minProg = 0.30;

    // Skill: Iron Curtain (Defense Boost)
    // -50% Attack handled in snapshot. +40% Defense (EnemyEff Reduction) handled here.
    let PlayerEff = Math.max(1.0, playerBaseSum);
    let EnemyEff = Math.max(1.0, enemyBaseSum);

    if (skills.iron_curtain) {
         // "Defense +40%". Original code: EnemyEff /= 1.4.
         EnemyEff /= 1.4;
    }

    const r = Math.log(PlayerEff / EnemyEff);
    const adv = Math.tanh(Math.abs(r) / S);
    const rawMag = minProg + (1.0 - minProg) * Math.pow(adv, gamma);
    const deltaMag = K_phase * rawMag;

    const p = 1 / (1 + Math.exp(-a * r));
    const isPlayerWinner = Math.random() < p;
    const sign = isPlayerWinner ? 1 : -1;

    const winnerProb = isPlayerWinner ? p : (1.0 - p);
    let efficiency = winnerProb;
    if (efficiency < 0.20) efficiency = 0.20;
    if (efficiency >= 0.90) efficiency = 1.0;

    const variance = 0.9 + Math.random() * 0.2;
    const finalDelta = sign * deltaMag * efficiency * variance;

    let delta = Math.max(-MaxClamp, Math.min(MaxClamp, finalDelta));

    // 4. Sacrifice Logic
    let sacrificeSwing = 0;
    let triggeredSacrifice = false;
    let triggerBrilliantBounty = false;
    let logMessage = '';

    // Scripted Sacrifices
    let forceSacrifice = false;
    const opGambit = getSkillLevel(skills, 'op_gambit');
    const midGambit = getSkillLevel(skills, 'mid_gambit');
    const endGambit = getSkillLevel(skills, 'end_gambit');

    if (opGambit > 0 && moveNumber === 5) forceSacrifice = true;
    if (midGambit > 0 && moveNumber === 25) forceSacrifice = true;
    if (endGambit > 0 && moveNumber === 35) forceSacrifice = true;

    if (forceSacrifice) {
        triggeredSacrifice = true;
        const successChance = Math.min(playerStats.sacrifices * 0.2, 100);
        const roll = Math.random() * 100;

        if (roll < successChance) {
             sacrificeSwing = 5.0;
             logMessage = '!! GAMBIT !! A prepared sacrifice strikes!';
             if (skills.brilliant_bounty) triggerBrilliantBounty = true;
        } else {
             sacrificeSwing = -2.0;
             logMessage = 'Gambit Refuted... The sacrifice was unsound.';
        }
        delta += sacrificeSwing;

    } else {
        // Random Sacrifice
        if (moveNumber > 5 && sacrificesCount < maxSacrifices) {
            let initiator = null;
            const playerRoll = Math.random();
            const enemyRoll = Math.random();

            if (playerRoll < sacrificeChance) initiator = 'player';
            else if (enemyRoll < sacrificeChance) initiator = 'enemy';

            if (initiator) {
                triggeredSacrifice = true;
                const isPlayer = initiator === 'player';
                const actorStats = isPlayer ? playerStats : enemyStats;
                const successChance = Math.min(actorStats.sacrifices * 0.2, 100);
                const roll = Math.random() * 100;

                if (isPlayer) {
                    if (roll < successChance) {
                        sacrificeSwing = 5.0;
                        logMessage = '!! BRILLIANT SACRIFICE !! The engine didn\'t see it coming!';
                        if (skills.brilliant_bounty) triggerBrilliantBounty = true;
                    } else {
                        sacrificeSwing = -2.0;
                        logMessage = 'Unsound Sacrifice... The opponent refutes it.';
                    }
                } else {
                    if (roll < successChance) {
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
    }

    // 5. Eval Injection
    const opCaro = getSkillLevel(skills, 'op_caro');
    const midBoost = getSkillLevel(skills, 'mid_boost');
    const endBoost = getSkillLevel(skills, 'end_boost');

    if (opCaro > 0 && moveNumber === 1) delta += (0.1 * opCaro);
    if (midBoost > 0 && moveNumber === (phases.openingEnd + 1)) delta += (0.1 * midBoost);
    if (endBoost > 0 && moveNumber === (phases.midgameEnd + 1)) delta += (0.1 * endBoost);

    // Skill: Lasker's Defense
    if (skills.lasker_defense && moveNumber > 20) {
        if (currentEval < -1.0 && delta > 0) delta *= 2.0;
    }

    let newEval = currentEval + delta;

    // Endgame Snowball
    if (phase === PHASES.ENDGAME.name) {
        if (newEval > 1.0 || newEval < -1.0) newEval *= 1.1;
    }

    // Resolution
    let result = null;
    const winThreshold = skills.decisive_blow ? 5.0 : 8.0;

    if (newEval >= winThreshold) result = 'win';
    else if (newEval <= -winThreshold) result = 'loss';

    // Draw Checks
    if (!result && moveNumber >= 30 && moveNumber < phases.maxTurns) {
        if (newEval > -1.0 && newEval < 1.0) {
            if (Math.random() < 0.15) {
                result = 'draw';
                logMessage = 'Draw agreed in deadlocked position.';
            }
        }
    }

    if (!result && moveNumber >= phases.maxTurns) {
        if (skills.iron_curtain && newEval > -8.0) {
            result = 'win';
            logMessage = 'Iron Curtain! Survival is Victory.';
        } else {
            const playerAgg = playerStats.tactics + playerStats.sacrifices;
            const enemyAgg = enemyStats.tactics + enemyStats.sacrifices;

            if (playerAgg > enemyAgg) {
                result = 'win';
                logMessage = 'Draw avoided! Player wins by Tactical Superiority.';
            } else if (enemyAgg > playerAgg) {
                result = 'loss';
                logMessage = 'Draw avoided! Opponent wins by Tactical Superiority.';
            } else {
                result = 'draw';
                logMessage = `Game drawn by move limit (${phases.maxTurns}).`;
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
        sacrificesCount: (triggeredSacrifice && !forceSacrifice) ? sacrificesCount + 1 : sacrificesCount,
        hasSacrificed: triggeredSacrifice,
        triggerBrilliantBounty,
        effectivePlayerStats: playerStats,
        effectiveEnemyStats: enemyStats,
        K_phase,
        debugLogs: snapshot.debugBreakdown ? [snapshot.debugBreakdown] : []
    };
};
