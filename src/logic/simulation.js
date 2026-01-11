import { STATS } from './math.js';

export const PHASES = {
  OPENING: { start: 1, end: 10, name: 'Opening' },
  MIDGAME: { start: 11, end: 30, name: 'Midgame' },
  ENDGAME: { start: 31, end: 50, name: 'Endgame' }
};

const getRandom = (min, max) => Math.random() * (max - min) + min;

const applyModeWeights = (stats, mode) => {
    // Clone stats to avoid mutation
    const s = { ...stats };

    // Default weights (Rapid)
    let theoryWeight = 1.0;
    let instinctWeight = 1.0;

    if (mode === 'classical') {
        theoryWeight = 1.5;
        instinctWeight = 0.6;
    } else if (mode === 'blitz') {
        theoryWeight = 0.6;
        instinctWeight = 1.8;
    }

    // Apply weights
    s.opening *= theoryWeight;
    s.midgame *= theoryWeight;
    s.endgame *= theoryWeight;

    s.tactics *= instinctWeight;
    s.sacrifices *= instinctWeight;

    return s;
};

// Helper: Get Min/Max stats sum for a given Tier
// Tier 1: 100 to 300.
// Range increases by 1.5x per Tier.
const getTierBounds = (tier) => {
    let min = 100;
    let range = 200; // Tier 1 Range (300 - 100)

    // Loop to calculate bounds for higher tiers
    for (let i = 1; i < tier; i++) {
        min += range; // New Min is Prev Max
        range *= 1.5; // Range Expands
    }

    return { min, max: min + range };
};

export const generateOpponentStats = (wins) => {
  // Logic: Tier-Based Interpolation
  // Rank = wins + 1.
  const rank = wins + 1;
  
  // 1. Determine Tier (Ceil of Rank/10)
  // Rank 1-10 -> Tier 1. Rank 11-20 -> Tier 2.
  const tier = Math.ceil(rank / 10);
  
  // 2. Determine Progress within Tier (0.0 to 1.0)
  // Rank 1 -> 0/9 = 0. Rank 10 -> 9/9 = 1.
  // RankInTier is 0-indexed relative to tier start.
  const rankInTier = (rank - 1) % 10;
  const progress = rankInTier / 9.0;

  // 3. Get Bounds
  const { min, max } = getTierBounds(tier);

  // 4. Interpolation with Curve (Power 1.5)
  // TotalStats = Min + (Range * progress^1.5)
  const range = max - min;
  let totalStats = min + (range * Math.pow(progress, 1.5));

  // Round to integer
  totalStats = Math.round(totalStats);
  
  // Ensure minimum stats
  const numStats = STATS.length;
  if (totalStats < numStats) totalStats = numStats;
  
  const stats = {
    opening: 1,
    midgame: 1,
    endgame: 1,
    tactics: 1,
    sacrifices: 1
  };
  
  let remainingPoints = totalStats - numStats; // We already gave 1 to each
  
  while (remainingPoints > 0) {
    const randomStat = STATS[Math.floor(Math.random() * numStats)];
    stats[randomStat]++;
    remainingPoints--;
  }
  
  // Opponent ELO = 100 + Sum(Stats)
  const totalPower = Object.values(stats).reduce((a, b) => a + b, 0);
  const opponentElo = 100 + totalPower;
  
  return {
      stats,
      totalPower: opponentElo,
      rawStatsSum: totalPower,
      tier,
      currentOpponent: rankInTier + 1
  };
};

export const calculateMove = (moveNumber, rawPlayerStats, rawEnemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0, mode = 'rapid') => {
  // Apply Mode Weights first
  const playerStats = applyModeWeights(rawPlayerStats, mode);
  const enemyStats = applyModeWeights(rawEnemyStats, mode);

  let phase = '';
  let playerBaseSum = 0;
  let enemyBaseSum = 0;
  let logMessage = '';
  
  // Determine Phase and Relevant Stats
  if (moveNumber <= PHASES.OPENING.end) {
    phase = PHASES.OPENING.name;
    
    // Main Line (Category A): Opening >= 100 -> +10% Power
    let openingPower = playerStats.opening;
    // Note: Use RAW stats for threshold checks or Weighted? Usually raw for logic gates.
    // "Opening >= 100" refers to the level.
    if (skills.main_line && rawPlayerStats.opening >= 100) {
        openingPower *= 1.1;
    }
    
    // Tactics Weight: 0.2
    let tacticsPower = playerStats.tactics;
    // Gambiteer (Category A): +20% Tactics Power
    if (skills.gambiteer) {
        tacticsPower *= 1.2;
    }
    // Calculation (Category D): Flat +5% Tactics Power
    if (skills.calculation) {
        tacticsPower *= 1.05;
    }
    
    playerBaseSum = openingPower + (tacticsPower * 0.2);
    enemyBaseSum = enemyStats.opening + (enemyStats.tactics * 0.2);
    
  } else if (moveNumber <= PHASES.MIDGAME.end) {
    phase = PHASES.MIDGAME.name;
    
    // Midgame Stat Buffs
    let midgamePower = playerStats.midgame;
    
    // Battery Attack (Category B): Phase 1 Won -> +10% Midgame Power
    if (skills.battery_attack && phase1Won) {
        midgamePower *= 1.1;
    }
    // Counter-Play (Category B): Losing at Move 11 -> +15% Midgame Power
    if (skills.counter_play && move11Eval < 0) {
        midgamePower *= 1.15;
    }
    // Knight Outpost (Category B): Flat +10% Midgame Power
    if (skills.knight_outpost) {
        midgamePower *= 1.1;
    }
    
    // Tactics Weight: 0.8
    let tacticsPower = playerStats.tactics;
    if (skills.gambiteer) tacticsPower *= 1.2;
    if (skills.calculation) tacticsPower *= 1.05;

    playerBaseSum = midgamePower + (tacticsPower * 0.8);
    enemyBaseSum = enemyStats.midgame + (enemyStats.tactics * 0.8);
    
    // Psychological Edge (Category A): Phase 1 Won -> Enemy Power -5%
    if (skills.psychological_edge && phase1Won) {
        enemyBaseSum *= 0.95;
    }
    
    // Tempo Gain (Category B): Move 25 -> Enemy Power 0.5x
    if (skills.tempo_gain && moveNumber === 25) {
        enemyBaseSum *= 0.5;
    }

  } else {
    phase = PHASES.ENDGAME.name;
    
    // Tactics Weight: 1.5
    let tacticsPower = playerStats.tactics;
    if (skills.gambiteer) tacticsPower *= 1.2;
    if (skills.calculation) tacticsPower *= 1.05;
    
    playerBaseSum = playerStats.endgame + (tacticsPower * 1.5);
    enemyBaseSum = enemyStats.endgame + (enemyStats.tactics * 1.5);
    
    // Zugzwang (Category E): Enemy Power *= 0.99 per turn in endgame
    if (skills.zugzwang) {
        const movesInEndgame = moveNumber - 30; // 1 at move 31
        if (movesInEndgame > 0) {
            enemyBaseSum *= Math.pow(0.99, movesInEndgame);
        }
    }
  }
  
  // Power Calculation: (Sum * 0.5) * Random
  // Complex Positions (Category B): Range [0.85, 1.15] in Midgame
  let minR = 0.95, maxR = 1.05;
  if (skills.complex_positions && phase === PHASES.MIDGAME.name) {
      minR = 0.85; maxR = 1.15;
  }
  
  // Tablebase (Category E): Eval > 1.0 at Move 40 -> Enemy Random = 1.0 (Fixed)
  let enemyMinR = minR, enemyMaxR = maxR;
  if (skills.tablebase && moveNumber > 40 && currentEval > 1.0) {
      enemyMinR = 1.0; enemyMaxR = 1.0;
  }

  const playerPower = (playerBaseSum * 0.5) * getRandom(minR, maxR);
  const enemyPower = (enemyBaseSum * 0.5) * getRandom(enemyMinR, enemyMaxR);
  
  // Dampened Delta
  let dampeningFactor = 0.1;
  
  // Positional Squeeze (Category B): If Delta > 0 (Calculated later), increase factor
  // But we need the raw delta first.
  let rawDelta = playerPower - enemyPower;
  
  // Pin (Category D): Midgame, Delta < 0 -> 20% chance Delta = 0
  if (skills.pin && phase === PHASES.MIDGAME.name && rawDelta < 0) {
      if (Math.random() < 0.2) {
          rawDelta = 0;
          logMessage = 'Pin! Enemy move negated.';
      }
  }

  let delta = rawDelta * dampeningFactor;
  
  // Positional Squeeze logic applied to Delta direction
  if (skills.positional_squeeze && delta > 0) {
      delta *= 1.1;
  }
  
  // Fork (Category D): If Delta > 0, add +0.1
  if (skills.fork && delta > 0) {
      delta += 0.1;
  }
  
  // Lucena / Philidor (Category E) - Affect Dampening based on Eval
  if (phase === PHASES.ENDGAME.name) {
      if (skills.lucena_position && currentEval > 0) {
          // Eval > 0 (Winning) -> Move Faster (Increase Delta magnitude effectively)
          delta *= 1.05; 
      }
      if (skills.philidor_position && currentEval < 0) {
          // Eval < 0 (Losing) -> Move Slower (Decrease Delta magnitude)
          delta *= 0.95;
      }
  }
  
  // Sacrifice Mechanic (Midgame Only)
  let sacrificeSwing = 0;
  if (phase === PHASES.MIDGAME.name) {
    // Tal's Spirit (Category C): Max +3.5
    const sacMax = skills.tals_spirit ? 3.5 : 3.0;
    
    // Sacrifice Swing
    // Note: Use weighted sacrifices or raw? Weighted makes sense for combat.
    let rawSwing = (playerStats.sacrifices * 0.05) * getRandom(-2.0, sacMax);
    
    // Chaos Theory (Category C): Scale by Enemy Tier
    if (skills.chaos_theory) {
        // We use raw enemy stats to determine "tier" (Elo is based on raw stats)
        const enemyTotalStats = Object.values(rawEnemyStats).reduce((a, b) => a + b, 0);
        const enemyElo = 100 + enemyTotalStats;
        const tier = Math.floor(enemyElo / 500);
        rawSwing *= (1 + (tier * 0.1));
    }
    
    // Desperado (Category C): Eval < -3.0 -> Effectiveness * 2
    if (skills.desperado && currentEval < -3.0) {
        rawSwing *= 2;
    }
    
    // Sound Sacrifice (Category C): Negative swing halved
    if (skills.sound_sacrifice && rawSwing < 0) {
        rawSwing /= 2;
    }
    
    sacrificeSwing = rawSwing;
    delta += sacrificeSwing;
  }
  
  // Greek Gift (Category C): Move 20, 30% chance +2.0
  if (skills.greek_gift && moveNumber === 20) {
      if (Math.random() < 0.3) {
          delta += 2.0;
          logMessage = 'Greek Gift! +2.0 Eval.';
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
  
  // Mate Net (Category D): Win Condition 8.0 (Lowered from 10.0 -> 8.0, and Mate Net 6.0)
  const winThreshold = skills.mate_net ? 6.0 : 8.0;
  
  // 1. Check Win/Loss Bounds
  if (newEval >= winThreshold) result = 'win';
  else if (newEval <= -winThreshold) result = 'loss';
  
  // 2. Check Draw Condition A (Remis Zone)
  // Move 30 to 49, Eval between -1.0 and +1.0 -> 15% chance
  if (!result && moveNumber >= 30 && moveNumber <= 49) {
    let drawChance = 0.15;
    
    // Fortress (Category E): Eval [-5, -2] -> Draw Chance 40%
    if (skills.fortress && newEval >= -5.0 && newEval <= -2.0) {
        drawChance = 0.4;
        if (Math.random() < drawChance) {
            result = 'draw';
            logMessage = 'Fortress holds! Draw agreed.';
        }
    } else if (newEval > -1.0 && newEval < 1.0) {
      if (Math.random() < drawChance) {
        result = 'draw';
        logMessage = 'Draw agreed in deadlocked position.';
      }
    }
  }
  
  // 3. Check Draw Condition B (Move 50 Limit) with Tie-Breaker
  if (!result && moveNumber >= 50) {
    // Tie-Breaker Logic: Compare Tactical Aggression (Weighted or Raw?)
    // "Higher total Tactics + Sacrifices".
    // Usually rules refer to the underlying attribute, but "Tricks don't work well" in classical
    // might mean the tie breaker should also use weighted values.
    // Let's use weighted to be consistent with mode logic.

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
  
  return {
    delta,
    newEval,
    result,
    phase,
    sacrificeSwing,
    logMessage
  };
};
