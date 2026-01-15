
export const calculatePuzzleDifficulty = (puzzleElo) => {
  return puzzleElo * (0.9 + Math.random() * 0.2);
};

export const calculateSacrificeMultiplier = (sacrificeLevel) => {
  // Chance is Level * 0.2 (e.g. Lvl 10 = 2, Lvl 50 = 10, Lvl 500 = 100)
  // We need decimal probability: Lvl 10 = 0.02
  const chanceDecimal = (sacrificeLevel * 0.2) / 100;

  // Formula: PartnerStat * (ChanceDecimal * 10)
  // Multiplier = ChanceDecimal * 10
  return chanceDecimal * 10;
};

export const resolvePuzzle = (puzzle, playerStats, puzzleTarget) => {
  const skill1 = puzzle.skills[0];
  const skill2 = puzzle.skills[1];

  let val1 = playerStats[skill1] || 0;
  let val2 = playerStats[skill2] || 0;

  // Sacrifice Logic
  // If a skill is 'sacrifice', the value comes from the PARTNER stat multiplied by sacrifice factor.
  // Note: One of the skills MUST be sacrifice for this logic to trigger, or both?
  // The themes are pairs. e.g. ['opening', 'sacrifice'].
  // If skill1 is sacrifice, its value is derived from skill2 * sacrifice_multiplier.
  // If skill2 is sacrifice, its value is derived from skill1 * sacrifice_multiplier.

  if (skill1 === 'sacrifice') {
      const mult = calculateSacrificeMultiplier(playerStats.sacrifices || 0);
      val1 = val2 * mult;
  }

  if (skill2 === 'sacrifice') {
      const mult = calculateSacrificeMultiplier(playerStats.sacrifices || 0);
      val2 = val1 * mult; // Note: if both are sacrifice (not possible in current themes), this would recurse or zero out?
                         // Current themes only have one sacrifice skill max, except maybe special pairs?
                         // No theme is ['sacrifice', 'sacrifice'].
  }

  const totalPower = val1 + val2;
  const success = totalPower >= puzzleTarget;

  return {
      success,
      totalPower,
      puzzleTarget,
      skill1Val: val1,
      skill2Val: val2
  };
};
