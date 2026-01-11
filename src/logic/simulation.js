import { STATS } from './math';

export const PHASES = {
  OPENING: { start: 1, end: 10, name: 'Opening' },
  MIDGAME: { start: 11, end: 30, name: 'Midgame' },
  ENDGAME: { start: 31, end: 50, name: 'Endgame' }
};

const getRandom = (min, max) => Math.random() * (max - min) + min;

export const generateOpponentStats = (wins) => {
  // Base Total: 10 * (1.25 ^ wins)
  let totalStats = 10 * Math.pow(1.25, wins);
  
  // Spike every 10th tournament (Tournament 10, 20, etc.)
  // Current tournament number is wins + 1.
  if ((wins + 1) % 10 === 0) {
    totalStats *= 3;
  }
  
  // Round to nearest integer
  totalStats = Math.round(totalStats);
  
  // Ensure minimum stats
  const numStats = STATS.length;
  if (totalStats < numStats) totalStats = numStats; // At least 1 per stat
  
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
  
  // Note: Previous code used 'totalPower' as the rating number (10, 15...).
  // Now we return opponentElo (110, 115...) as distinct from stats sum.
  // We'll keep totalPower as the raw stats sum for internal consistency if needed,
  // but the UI might want to show ELO.
  
  return { stats, totalPower: opponentElo, rawStatsSum: totalPower };
};

export const calculateMove = (moveNumber, playerStats, enemyStats, currentEval, skills = {}, phase1Won = false, move11Eval = 0) => {
  let phase = '';
  let playerBaseSum = 0;
  let enemyBaseSum = 0;
  let logMessage = '';
  
  // Determine Phase and Relevant Stats
  if (moveNumber <= PHASES.OPENING.end) {
    phase = PHASES.OPENING.name;
    
    // Main Line (Category A): Opening >= 100 -> +10% Power
    let openingPower = playerStats.opening;
    if (skills.main_line && playerStats.opening >= 100) {
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
    // We check move11Eval passed from simulation state
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
    let rawSwing = (playerStats.sacrifices * 0.05) * getRandom(-2.0, sacMax);
    
    // Chaos Theory (Category C): Scale by Enemy Tier
    if (skills.chaos_theory) {
        // Enemy Tier = Floor(EnemyElo / 500)
        // Enemy Elo is 100 + Sum(Stats). We need total enemy stats here.
        // We only have broken down stats. Recalculate sum.
        const enemyTotalStats = Object.values(enemyStats).reduce((a, b) => a + b, 0);
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
  
  const newEval = currentEval + delta;
  
  // Resolution Logic
  let result = null; // 'win', 'loss', 'draw', or null (continue)
  
  // Mate Net (Category D): Win Condition 8.0
  const winThreshold = skills.mate_net ? 8.0 : 10.0;
  
  // 1. Check Win/Loss Bounds
  if (newEval >= winThreshold) result = 'win';
  else if (newEval <= -10) result = 'loss';
  
  // 2. Check Draw Condition A (Remis Zone)
  // Move 30 to 49, Eval between -1.0 and +1.0 -> 15% chance
  if (!result && moveNumber >= 30 && moveNumber <= 49) {
    let drawChance = 0.15;
    
    // Fortress (Category E): Eval [-5, -2] -> Draw Chance 40%
    if (skills.fortress && newEval >= -5.0 && newEval <= -2.0) {
        // Override standard logic? Or addition? 
        // Standard logic applies only -1 to 1.
        // Fortress adds a NEW condition range? 
        // "Draw Chance per turn increases from 15% to 40%". 
        // Implicitly means we check this range instead/also.
        // Since [-5, -2] is outside [-1, 1], this is a separate check.
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
  
  // 3. Check Draw Condition B (Move 50 Limit)
  if (!result && moveNumber >= 50) {
    result = 'draw';
    logMessage = 'Game drawn by move limit (50).';
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
