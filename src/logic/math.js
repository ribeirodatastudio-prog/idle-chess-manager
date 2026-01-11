export const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices'];

export const calculatePassiveIncomePerSecond = (wins) => {
  // Formula: (1 + wins) * (1.1 ^ wins) per minute
  // Per second = / 60
  const baseIncomePerMinute = (1 + wins);
  const multiplier = Math.pow(1.1, wins);
  const totalPerMinute = baseIncomePerMinute * multiplier;
  return totalPerMinute / 60;
};

export const calculateUpgradeCost = (currentLevel, hasPrepFiles = false) => {
  // Base Cost: 1
  // Growth: 1.1x per level
  // Spike: 5x at 100, 200, etc.
  
  let cost = 1 * Math.pow(1.1, currentLevel - 1);
  
  // Spike logic
  if ((currentLevel + 1) % 100 === 0) {
    cost *= 5;
  }
  
  // Prep Files Discount (Category A)
  if (hasPrepFiles) {
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
