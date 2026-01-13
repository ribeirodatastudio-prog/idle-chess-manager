export const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices', 'defense'];

export const calculatePassiveIncomePerSecond = (wins) => {
  // Formula: (1 + wins) * (1.1 ^ wins) per minute
  // Per second = / 60
  const baseIncomePerMinute = (1 + wins);
  const multiplier = Math.pow(1.1, wins);
  const totalPerMinute = baseIncomePerMinute * multiplier;
  return totalPerMinute / 60;
};

export const calculateUpgradeCost = (currentLevel, hasPrepFiles = false, statName = '') => {
  // Base Cost: 1
  // Growth: 1.1x per level
  let cost = 1 * Math.pow(1.1, currentLevel - 1);
  
  if (statName === 'sacrifices') {
      // The Wall: Every 50 levels, the cost jumps by 1000x and STAYS there.
      // Tier 0 (0-48): 1x
      // Tier 1 (49-98): 1000x
      // Tier 2 (99-148): 1,000,000x
      const wallTier = Math.floor((currentLevel + 1) / 50);
      const wallMultiplier = Math.pow(1000, wallTier);
      cost *= wallMultiplier;

      // Note: Standard 5x spike does NOT apply to sacrifices to avoid double spiking.
  } else {
      // Standard Spike logic for other stats
      if ((currentLevel + 1) % 100 === 0) {
        cost *= 5;
      }
  }
  
  // Prep Files Discount (Category A)
  if (hasPrepFiles && statName === 'opening') {
    cost *= 0.8;
  }
  
  return cost;
};

export const calculateStatPower = (level) => {
  return level * 0.5;
};

export const calculateOfflineGain = (lastSaveTime, wins) => {
  if (!lastSaveTime) return 0;
  
  const now = Date.now();
  const diffInSeconds = (now - lastSaveTime) / 1000;
  
  if (diffInSeconds <= 0) return 0;
  
  const incomePerSecond = calculatePassiveIncomePerSecond(wins);
  return incomePerSecond * diffInSeconds;
};
