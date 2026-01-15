export const STATS = ['opening', 'midgame', 'endgame', 'tactics', 'sacrifices', 'defense'];

export const calculatePassiveIncomePerMinute = (tournamentIndex) => {
  // Base Rate: 1 + tournamentIndex (Per Minute).
  // Multiplier: Math.pow(1.05, tournamentIndex)
  const baseRate = 1 + tournamentIndex;
  const multiplier = Math.pow(1.05, tournamentIndex);
  return baseRate * multiplier;
};

export const calculatePassiveIncomePerSecond = (tournamentIndex) => {
  const perMinute = calculatePassiveIncomePerMinute(tournamentIndex);
  return perMinute / 60;
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
  } else if (statName === 'defense' || statName === 'tactics') {
      // Defense/Tactics: Spike 5x every 75 levels (Permanent)
      const spikeTier = Math.floor((currentLevel + 1) / 75);
      const spikeMultiplier = Math.pow(5, spikeTier);
      cost *= spikeMultiplier;
  } else {
      // Standard Spike logic for other stats (Opening, Midgame, Endgame)
      // Spike 5x every 100 levels (Permanent)
      const spikeTier = Math.floor((currentLevel + 1) / 100);
      const spikeMultiplier = Math.pow(5, spikeTier);
      cost *= spikeMultiplier;
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
