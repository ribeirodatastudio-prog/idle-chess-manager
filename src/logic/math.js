export const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices', 'defense'];

export const calculatePassiveIncomePerMinute = (tournamentWins, tiersCleared = 0) => {
  // Base Rate: 1 + tournamentWins (Per Minute).
  // Multiplier: 1.01 ^ tiersCleared
  // Note: tiersCleared includes tiers from completed tournaments (cumulative)
  const baseRate = 1 + tournamentWins;
  const multiplier = Math.pow(1.01, tiersCleared);
  return baseRate * multiplier;
};

export const calculatePassiveIncomePerSecond = (tournamentWins, tiersCleared = 0) => {
  const perMinute = calculatePassiveIncomePerMinute(tournamentWins, tiersCleared);
  return perMinute / 60;
};

// Internal Helper: Standard Growth Logic
// Tier 1 (0-500): 1.03
// Tier 2 (501-10000): 1.08
// Tier 3 (10001+): 1.15
const getStandardCost = (targetLevel) => {
  // Tier 1
  if (targetLevel <= 500) {
    return Math.pow(1.03, targetLevel - 1);
  }

  // Anchor at Level 500
  const costAt500 = Math.pow(1.03, 499);
  
  // Tier 2
  if (targetLevel <= 10000) {
    return costAt500 * Math.pow(1.08, targetLevel - 500);
  }

  // Anchor at Level 10000
  const costAt10000 = costAt500 * Math.pow(1.08, 10000 - 500);

  // Tier 3
  return costAt10000 * Math.pow(1.15, targetLevel - 10000);
};

// Internal Helper: Sacrifice Growth Logic
// Tier 1 (0-100): 1.10
// Tier 2 (101-300): 1.15
// Tier 3 (301-500): 1.20
const getSacrificeCost = (targetLevel) => {
  // Tier 1
  if (targetLevel <= 100) {
    return Math.pow(1.10, targetLevel - 1);
  }

  // Anchor at Level 100
  const costAt100 = Math.pow(1.10, 99);

  // Tier 2
  if (targetLevel <= 300) {
    return costAt100 * Math.pow(1.15, targetLevel - 100);
  }

  // Anchor at Level 300
  const costAt300 = costAt100 * Math.pow(1.15, 300 - 100);

  // Tier 3
  return costAt300 * Math.pow(1.20, targetLevel - 300);
};

// Group Definitions
const GROUPS = {
    opening: 'phase',
    midgame: 'phase',
    endgame: 'phase',
    tactics: 'instinct',
    defense: 'instinct',
    sacrifices: null // Special, no tax
};

// Helper to calculate foreign levels
const getForeignLevels = (statName, allStats) => {
    const group = GROUPS[statName];
    if (!group) return 0;

    let foreign = 0;
    // Iterate over known stats in that group
    Object.keys(GROUPS).forEach(key => {
        if (GROUPS[key] === group && key !== statName) {
            foreign += (allStats[key] || 0);
        }
    });
    return foreign;
};

// Helper to get Tax Rate based on Target Skill's Current Tier (Level)
const getTaxRate = (level) => {
    // Note: level passed here is the CURRENT OWNED LEVEL (not target)
    // "If Target is Tier 1" implies current status.
    // Tier 1: 0-500
    // Tier 2: 501-10000
    // Tier 3: 10001+

    if (level <= 500) return 1.015;
    if (level <= 10000) return 1.04;
    return 1.075;
};

export const calculateCostBreakdown = (currentLevel, allStats = {}, statName = '') => {
    const targetLevel = currentLevel + 1;
    let baseCost = 0;

    if (statName === 'sacrifices') {
        baseCost = getSacrificeCost(targetLevel);
    } else {
        baseCost = getStandardCost(targetLevel);
    }

    // Focus Tax Logic
    let multiplier = 1.0;
    let foreignLevels = 0;

    // Only apply tax if it has a group (Sacrifice is null)
    if (GROUPS[statName]) {
        foreignLevels = getForeignLevels(statName, allStats);

        // Tax Rate based on *Current* Level (the Tier you are in)
        const taxRate = getTaxRate(currentLevel);

        multiplier = Math.pow(taxRate, foreignLevels);

        // Safety Cap
        if (multiplier > 1e50) {
            multiplier = 1e50;
        }
    }

    const totalCost = baseCost * multiplier;

    return {
        baseCost,
        multiplier,
        foreignLevels,
        totalCost,
        isCapped: multiplier >= 1e50
    };
};

// Wrapper for backward compatibility (and simple usage)
export const calculateUpgradeCost = (currentLevel, allStats = {}, statName = '') => {
    // Backward compatibility for old calls: calculateUpgradeCost(level, boolean, statName)
    let stats = allStats;
    if (typeof allStats === 'boolean') {
        stats = {};
    }

    return calculateCostBreakdown(currentLevel, stats, statName).totalCost;
};

export const calculateStatPower = (level) => {
  return level * 0.5;
};

export const calculateOfflineGain = (lastSaveTime, productionPerSecond) => {
  if (!lastSaveTime) return null;
  
  const now = Date.now();
  let diffInSeconds = (now - lastSaveTime) / 1000;

  // Constraint A: Minimum 60s
  if (diffInSeconds < 60) return null;
  
  // Constraint B: Cap at 24h (86400s)
  if (diffInSeconds > 86400) diffInSeconds = 86400;
  
  return {
      gain: productionPerSecond * diffInSeconds,
      seconds: diffInSeconds
  };
};
