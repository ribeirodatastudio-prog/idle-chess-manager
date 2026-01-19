import { STATS } from './math.js';
import { getOpponentIdentity } from './identity.js';
import { TOURNAMENT_CONFIG } from './tournaments.js';
import { OPPONENTS } from '../data/opponents.js';

export const PHASES = {
  OPENING: { start: 1, end: 10, name: 'Opening' },
  MIDGAME: { start: 11, end: 30, name: 'Midgame' },
  ENDGAME: { start: 31, end: 50, name: 'Endgame' }
};

const getRandom = (min, max) => Math.random() * (max - min) + min;
const lerp = (start, end, t) => start + (end - start) * t;

const getSacrificeModeMultiplier = (mode) => {
    if (mode === 'classical') return 0.6;
    if (mode === 'blitz') return 1.8;
    if (mode === 'bullet') return 0.1;
    return 1.0;
};

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

  // ELO Parity: Total Stats Sum MUST match targetElo exactly.
  // No hidden 1.35x multiplier.
  let totalStats = targetElo;
  
  // Ensure minimum stats
  const numStats = STATS.length;
  if (totalStats < numStats) totalStats = numStats;

  // Select Random Archetype
  const archetype = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];

  const stats = {
    opening: 0,
    midgame: 0,
    endgame: 0,
    tactics: 0,
    sacrifices: 0,
    defense: 0
  };

  // Allocation Logic
  const skill1Val = Math.floor(totalStats * 0.35);
  const skill2Val = Math.floor(totalStats * 0.30);

  stats[archetype.skill1] += skill1Val;
  stats[archetype.skill2] += skill2Val;

  let remainingPoints = totalStats - skill1Val - skill2Val;

  // Distribute remainder randomly among the OTHER 4 skills
  const otherSkills = STATS.filter(s => s !== archetype.skill1 && s !== archetype.skill2);

  while (remainingPoints > 0) {
      const randomStat = otherSkills[Math.floor(Math.random() * otherSkills.length)];
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
  // Get color from logic (highest stat), but override Title and Hint from Archetype.
  const generatedIdentity = getOpponentIdentity(stats);
  const identity = {
      title: archetype.id,
      hint: archetype.tooltip,
      color: generatedIdentity.color
  };
  
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

export const calculateMove = (moveNumber, rawPlayerStats, rawEnemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0, mode = 'bullet', sacrificesCount = 0, phaseConfig = null, phase2Won = false) => {
  // --- PREPARATION & WEIGHTS ---
  const playerStats = applyModeWeights(rawPlayerStats, mode);
  const enemyStats = applyModeWeights(rawEnemyStats, mode);

  // --- SKILL MODIFIERS (STATS) ---
  if (skills.study_opening) playerStats.opening *= 1.1;
  if (skills.study_midgame) playerStats.midgame *= 1.1;
  if (skills.study_endgame) playerStats.endgame *= 1.1;

  if (skills.instinct_tactics) playerStats.tactics *= 1.1;
  if (skills.instinct_defense) playerStats.defense *= 1.1;

  // NEW: Instinct Debuffs (Disruption)
  const tacDebLvl = getSkillLevel(skills, 'inst_tac_deb');
  const defDebLvl = getSkillLevel(skills, 'inst_def_deb');
  const sacDebLvl = getSkillLevel(skills, 'inst_sac_deb');

  if (tacDebLvl > 0) enemyStats.tactics *= (1 - (0.01 * tacDebLvl));
  if (defDebLvl > 0) enemyStats.defense *= (1 - (0.01 * defDebLvl));
  if (sacDebLvl > 0) enemyStats.endgame *= (1 - (0.01 * sacDebLvl));

  // NEW: Instinct Momentum (Scaling)
  const tacScaleLvl = getSkillLevel(skills, 'inst_tac_scale');
  const defScaleLvl = getSkillLevel(skills, 'inst_def_scale');
  const sacScaleLvl = getSkillLevel(skills, 'inst_sac_scale'); // Affects sacrificeChance later

  if (tacScaleLvl > 0) playerStats.tactics *= Math.pow(1 + (0.005 * tacScaleLvl), moveNumber);
  if (defScaleLvl > 0) playerStats.defense *= Math.pow(1 + (0.005 * defScaleLvl), moveNumber);

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

  // Use provided phaseConfig or default to constants
  const phases = phaseConfig || {
      openingEnd: PHASES.OPENING.end,
      midgameEnd: PHASES.MIDGAME.end,
      maxTurns: PHASES.ENDGAME.end
  };

  let phase = '';
  let playerBaseSum = 0;
  let enemyBaseSum = 0;
  let logMessage = '';

  // Define K_phase and MaxClamp dynamically
  let K_phase = 0.25;
  let MaxClamp = 0.30;
  
  if (moveNumber <= phases.openingEnd) {
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

    // Tier 3 Debuff: Prepared Novelty (Enemy Opening -3%/lvl)
    const noveltyLvl = getSkillLevel(skills, 'op_novelty');
    if (noveltyLvl > 0) {
        enemyStats.opening *= (1 - (0.03 * noveltyLvl));
    }

    // Stats
    playerBaseSum = playerStats.opening + (playerStats.tactics * 0.2);
    enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);

    // Dynamic Interpolation
    const pStart = 1;
    const pEnd = phases.openingEnd;
    const progress = Math.min(1.0, Math.max(0.0, (moveNumber - pStart) / (pEnd - pStart)));

    K_phase = lerp(0.25, 0.35, progress);
    MaxClamp = lerp(0.30, 0.45, progress);
    
  } else if (moveNumber <= phases.midgameEnd) {
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

    // Tier 3 Debuff: Tactical Cloud (Enemy Tactics -3%/lvl)
    const cloudLvl = getSkillLevel(skills, 'mid_cloud');
    if (cloudLvl > 0) {
        enemyStats.tactics *= (1 - (0.03 * cloudLvl));
    }

    // Tier 3 Momentum: Space Advantage (If Phase 1 Won, +4% All Stats/lvl)
    if (phase1Won) {
        const spaceLvl = getSkillLevel(skills, 'op_space');
        if (spaceLvl > 0) {
            const mult = 1 + (0.04 * spaceLvl);
            playerStats.opening *= mult;
            playerStats.midgame *= mult;
            playerStats.endgame *= mult;
            playerStats.tactics *= mult;
            playerStats.sacrifices *= mult;
            playerStats.defense *= mult;
        }
    }

    // Stats
    playerBaseSum = playerStats.midgame + (playerStats.tactics * 0.8);
    enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);

    // Dynamic Interpolation
    const pStart = phases.openingEnd + 1;
    const pEnd = phases.midgameEnd;
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
    
    // Tier 3 Debuff: Tablebase Memory (Enemy Defense -3%/lvl)
    const tablebaseLvl = getSkillLevel(skills, 'end_tablebase');
    if (tablebaseLvl > 0) {
        enemyStats.defense *= (1 - (0.03 * tablebaseLvl));
    }

    // Tier 3 Momentum: Simplification (If Phase 2 Won, +4% All Stats/lvl)
    if (phase2Won) {
        const simplifyLvl = getSkillLevel(skills, 'mid_simplify');
        if (simplifyLvl > 0) {
            const mult = 1 + (0.04 * simplifyLvl);
            playerStats.opening *= mult;
            playerStats.midgame *= mult;
            playerStats.endgame *= mult;
            playerStats.tactics *= mult;
            playerStats.sacrifices *= mult;
            playerStats.defense *= mult;
        }
    }

    // Tier 3 Zugzwang (Enemy stats decay 1% per turn after move 30)
    // Applies to BaseSum calculation? Or Stats?
    // "Enemy stats decay". Let's apply to ALL enemy stats before BaseSum.
    const zugzwangLvl = getSkillLevel(skills, 'end_zugzwang');
    if (zugzwangLvl > 0 && moveNumber > 30) {
        const decay = 0.01 * zugzwangLvl * (moveNumber - 30);
        const multiplier = Math.max(0, 1.0 - decay);

        enemyStats.opening *= multiplier;
        enemyStats.midgame *= multiplier;
        enemyStats.endgame *= multiplier;
        enemyStats.tactics *= multiplier;
        enemyStats.sacrifices *= multiplier;
        enemyStats.defense *= multiplier;
    }

    // Stats
    playerBaseSum = playerStats.endgame + (playerStats.tactics * 1.5);
    enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);

    // Dynamic Interpolation
    const pStart = phases.midgameEnd + 1;
    const pEnd = phases.maxTurns;
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
  let sacrificeInitiator = null;
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

  // NEW: Instinct Momentum (Sacrifice Scaling)
  if (sacScaleLvl > 0) sacrificeChance *= Math.pow(1 + (0.005 * sacScaleLvl), moveNumber);

  // Phase Mastery Sacrifice Modifiers
  if (moveNumber <= phases.openingEnd) {
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

  // --- SCRIPTED SACRIFICES (GAMBITS) ---
  let forceSacrifice = false;

  const opGambit = getSkillLevel(skills, 'op_gambit');
  const midGambit = getSkillLevel(skills, 'mid_gambit');
  const endGambit = getSkillLevel(skills, 'end_gambit');

  if (opGambit > 0 && moveNumber === 5) forceSacrifice = true;
  if (midGambit > 0 && moveNumber === 25) forceSacrifice = true;
  if (endGambit > 0 && moveNumber === 35) forceSacrifice = true;

  // Logic:
  // If forceSacrifice, we set triggeredSacrifice = true and SKIP the chance check.
  // We also bypass the maxSacrifices limit check for this specific instance.

  if (forceSacrifice) {
      triggeredSacrifice = true;
      sacrificeInitiator = 'player';
      // We still need to determine success/fail, defaulting to Player initiation since it's a Player Skill

      const actorStats = playerStats;

      // Use raw sacrifice stats for success check (undo mode weight)
      const sacModeMult = getSacrificeModeMultiplier(mode);
      const effectiveSacrifices = actorStats.sacrifices / sacModeMult;

      const successChance = Math.min(effectiveSacrifices * 0.2, 100);
      const roll = Math.random() * 100;
      const isSuccess = roll < successChance;

      if (isSuccess) {
          sacrificeSwing = 5.0;
          logMessage = 'BRILLIANT!! A prepared gambit strikes!';
          if (skills.brilliant_bounty) triggerBrilliantBounty = true;
      } else {
          sacrificeSwing = -2.0;
          logMessage = 'REFUTED. The gambit was unsound.';
      }

      delta += sacrificeSwing;

  } else {
      // Standard Sacrifice Logic
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
            sacrificeInitiator = initiator;
            const isPlayer = initiator === 'player';
            const actorStats = isPlayer ? playerStats : enemyStats;

            // Use raw sacrifice stats for success check (undo mode weight)
            const sacModeMult = getSacrificeModeMultiplier(mode);
            const effectiveSacrifices = actorStats.sacrifices / sacModeMult;

            // Success Check: Roll < (Level * 0.2)
            const successChance = Math.min(effectiveSacrifices * 0.2, 100);
            const roll = Math.random() * 100;
            const isSuccess = roll < successChance;

            if (isPlayer) {
                if (isSuccess) {
                    sacrificeSwing = 5.0;
                    logMessage = 'BRILLIANT!! The engine didn\'t see it coming!';
                    if (skills.brilliant_bounty) triggerBrilliantBounty = true;
                } else {
                    sacrificeSwing = -2.0;
                    logMessage = 'UNSOUND... The opponent refutes it.';
                }
            } else {
                if (isSuccess) {
                    sacrificeSwing = -5.0;
                    logMessage = 'DEVASTATING! The AI unleashes chaos!';
                } else {
                    sacrificeSwing = 2.0;
                    logMessage = 'DENIED! You refuted the attack!';
                }
            }
            delta += sacrificeSwing;
        }
      }
  }

  // --- EVAL INJECTION (BOOSTS) ---
  const opCaro = getSkillLevel(skills, 'op_caro');
  const midBoost = getSkillLevel(skills, 'mid_boost');
  const endBoost = getSkillLevel(skills, 'end_boost');

  if (opCaro > 0 && moveNumber === 1) {
      delta += (0.1 * opCaro);
  }

  // Midgame Boost: Starts at openingEnd + 1
  if (midBoost > 0 && moveNumber === (phases.openingEnd + 1)) {
      delta += (0.1 * midBoost);
  }

  // Endgame Boost: Starts at midgameEnd + 1
  if (endBoost > 0 && moveNumber === (phases.midgameEnd + 1)) {
      delta += (0.1 * endBoost);
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
  // Adjusted for maxTurns? Remis zone is typically "Late Game but before limit"
  // Let's keep 30-49 range roughly, but maybe scale if maxTurns > 50?
  // User didn't specify Remis Zone change, but logically it should be near end.
  // For safety, let's keep 30 to (maxTurns - 1).

  if (!result && moveNumber >= 30 && moveNumber < phases.maxTurns) {
    if (newEval > -1.0 && newEval < 1.0) {
      if (Math.random() < 0.15) {
        result = 'draw';
        logMessage = 'Draw agreed in deadlocked position.';
      }
    }
  }
  
  // 3. Check Draw B (Move Limit)
  if (!result && moveNumber >= phases.maxTurns) {
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
            logMessage = `Game drawn by move limit (${phases.maxTurns}). Stats identical.`;
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
    // If forced sacrifice, return original count (do not consume). Else if triggered, increment.
    sacrificesCount: (triggeredSacrifice && !forceSacrifice) ? sacrificesCount + 1 : sacrificesCount,
    hasSacrificed: triggeredSacrifice,
    sacrificeInitiator,
    triggerBrilliantBounty,
    effectivePlayerStats: playerStats,
    effectiveEnemyStats: enemyStats,
    K_phase,
    MaxClamp // Exported for UI Notation
  };
};

export const simulateGame = (rawPlayerStats, rawEnemyStats, skills = {}, mode = 'bullet') => {
  const history = [];
  const phaseConfig = getPhaseConfig(skills);

  // Initial Eval Logic (Gambiteer)
  let currentEval = skills.gambiteer ? -0.5 : 0.3;

  let moveNumber = 0;
  let result = null;
  let phase1Won = false;
  let phase2Won = false;
  let move11Eval = 0;
  let sacrificesCount = 0;

  // Safety break at 100 moves (should finish by 50-60)
  while (!result && moveNumber < 100) {
      moveNumber++;

      const moveResult = calculateMove(
          moveNumber,
          rawPlayerStats,
          rawEnemyStats,
          currentEval,
          skills,
          phase1Won,
          move11Eval,
          mode,
          sacrificesCount,
          phaseConfig,
          phase2Won
      );

      // Update State Triggers
      if (moveNumber === phaseConfig.openingEnd && moveResult.newEval > 0) phase1Won = true;
      if (moveNumber === phaseConfig.midgameEnd && moveResult.newEval > 0) phase2Won = true;
      if (moveNumber === (phaseConfig.openingEnd + 1)) move11Eval = moveResult.newEval;

      currentEval = moveResult.newEval;
      result = moveResult.result;
      sacrificesCount = moveResult.sacrificesCount;

      history.push({
          moveNumber,
          ...moveResult,
          phase1Won,
          phase2Won,
          move11Eval // Store snapshot for debugging/replay consistency
      });
  }

  return history;
};

export const getEffectivePhaseStats = (rawPlayerStats, rawEnemyStats, skills = {}, mode = 'bullet') => {
  const phases = getPhaseConfig(skills);
  const phasesList = [
      { name: 'Opening', move: 1 },
      { name: 'Midgame', move: phases.openingEnd + 1 },
      { name: 'Endgame', move: phases.midgameEnd + 1 }
  ];

  const result = {
      player: { Opening: 0, Midgame: 0, Endgame: 0 },
      enemy: { Opening: 0, Midgame: 0, Endgame: 0 }
  };

  phasesList.forEach(p => {
      const moveNumber = p.move;

      // 1. Preparation
      const playerStats = applyModeWeights(rawPlayerStats, mode);
      const enemyStats = applyModeWeights(rawEnemyStats, mode);

      // 2. Skill Modifiers (Stats)
      if (skills.study_opening) playerStats.opening *= 1.1;
      if (skills.study_midgame) playerStats.midgame *= 1.1;
      if (skills.study_endgame) playerStats.endgame *= 1.1;

      if (skills.instinct_tactics) playerStats.tactics *= 1.1;
      if (skills.instinct_defense) playerStats.defense *= 1.1;

      // Instinct Debuffs
      const tacDebLvl = getSkillLevel(skills, 'inst_tac_deb');
      const defDebLvl = getSkillLevel(skills, 'inst_def_deb');
      const sacDebLvl = getSkillLevel(skills, 'inst_sac_deb');

      if (tacDebLvl > 0) enemyStats.tactics *= (1 - (0.01 * tacDebLvl));
      if (defDebLvl > 0) enemyStats.defense *= (1 - (0.01 * defDebLvl));
      if (sacDebLvl > 0) enemyStats.endgame *= (1 - (0.01 * sacDebLvl));

      // Instinct Momentum (Scaling)
      const tacScaleLvl = getSkillLevel(skills, 'inst_tac_scale');
      const defScaleLvl = getSkillLevel(skills, 'inst_def_scale');

      if (tacScaleLvl > 0) playerStats.tactics *= Math.pow(1 + (0.005 * tacScaleLvl), moveNumber);
      if (defScaleLvl > 0) playerStats.defense *= Math.pow(1 + (0.005 * defScaleLvl), moveNumber);

      // Chess 960
      if (mode === 'chess960') {
          let tacticMult = 1.0;
          if (moveNumber <= 10) tacticMult = 1.75;
          else if (moveNumber <= 30) tacticMult = 1.25;

          playerStats.tactics *= tacticMult;
          enemyStats.tactics *= tacticMult;
      }

      let playerBaseSum = 0;
      let enemyBaseSum = 0;

      if (p.name === 'Opening') {
          // Phase Mastery
          const defLvl = getSkillLevel(skills, 'op_def_master');
          const tacLvl = getSkillLevel(skills, 'op_tac_master');

          if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
          if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

          // Instinct Focus
          const instDefLvl = getSkillLevel(skills, 'inst_def_op');
          const instTacLvl = getSkillLevel(skills, 'inst_tac_op');

          if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
          if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));

          // Debuff: Prepared Novelty
          const noveltyLvl = getSkillLevel(skills, 'op_novelty');
          if (noveltyLvl > 0) {
              enemyStats.opening *= (1 - (0.03 * noveltyLvl));
          }

          // Stats
          playerBaseSum = playerStats.opening + (playerStats.tactics * 0.2);
          enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);

      } else if (p.name === 'Midgame') {
          // Phase Mastery
          const defLvl = getSkillLevel(skills, 'mid_def_master');
          const tacLvl = getSkillLevel(skills, 'mid_tac_master');

          if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
          if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

          // Instinct Focus
          const instDefLvl = getSkillLevel(skills, 'inst_def_mid');
          const instTacLvl = getSkillLevel(skills, 'inst_tac_mid');

          if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
          if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));

          // Debuff: Tactical Cloud
          const cloudLvl = getSkillLevel(skills, 'mid_cloud');
          if (cloudLvl > 0) {
              enemyStats.tactics *= (1 - (0.03 * cloudLvl));
          }

          // Stats
          playerBaseSum = playerStats.midgame + (playerStats.tactics * 0.8);
          enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);

      } else { // Endgame
          // Phase Mastery
          const defLvl = getSkillLevel(skills, 'end_def_master');
          const tacLvl = getSkillLevel(skills, 'end_tac_master');

          if (defLvl > 0) playerStats.defense *= (1 + (0.1 * defLvl));
          if (tacLvl > 0) playerStats.tactics *= (1 + (0.1 * tacLvl));

          // Instinct Focus
          const instDefLvl = getSkillLevel(skills, 'inst_def_end');
          const instTacLvl = getSkillLevel(skills, 'inst_tac_end');

          if (instDefLvl > 0) playerStats.defense *= (1 + (0.01 * instDefLvl));
          if (instTacLvl > 0) playerStats.tactics *= (1 + (0.01 * instTacLvl));

          // Debuff: Tablebase Memory
          const tablebaseLvl = getSkillLevel(skills, 'end_tablebase');
          if (tablebaseLvl > 0) {
              enemyStats.defense *= (1 - (0.03 * tablebaseLvl));
          }

          // Zugzwang (if move > 30)
          const zugzwangLvl = getSkillLevel(skills, 'end_zugzwang');
          if (zugzwangLvl > 0 && moveNumber > 30) {
              const decay = 0.01 * zugzwangLvl * (moveNumber - 30);
              const multiplier = Math.max(0, 1.0 - decay);
              enemyStats.endgame *= multiplier;
              enemyStats.tactics *= multiplier;
          }

          // Stats
          playerBaseSum = playerStats.endgame + (playerStats.tactics * 1.5);
          enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);
      }

      // Skill: Deep Blue
      if (skills.deep_blue) {
          playerBaseSum *= Math.pow(1.02, moveNumber);
      }

      // Skill: Iron Curtain (Attack Reduction)
      if (skills.iron_curtain) {
          playerBaseSum *= 0.5;
      }

      // Skill: Time Trouble (Endgame only really)
      if (skills.time_trouble && moveNumber > 35) {
          const dropOff = 1 - (0.04 * (moveNumber - 35));
          enemyBaseSum *= Math.max(0, dropOff);
      }

      result.player[p.name] = playerBaseSum;
      result.enemy[p.name] = enemyBaseSum;
  });

  return result;
};
