export const SKILLS = [
  // Category A: Opening
  {
    id: 'book_worm',
    name: 'Book Worm',
    description: 'If you win in < 20 moves, gain 1.5x Tournament Reward.',
    cost: 1,
    category: 'Opening'
  },
  {
    id: 'prep_files',
    name: 'Prep Files',
    description: 'Reduces the base cost of Opening upgrades by 20%.',
    cost: 1,
    category: 'Opening'
  },
  {
    id: 'psychological_edge',
    name: 'Psychological Edge',
    description: 'If you win Phase 1, Enemy Power is reduced by 5% during Phase 2.',
    cost: 1,
    category: 'Opening'
  },
  {
    id: 'main_line',
    name: 'Main Line',
    description: 'If Opening Level >= 100, gain +10% Opening Power.',
    cost: 1,
    category: 'Opening'
  },
  {
    id: 'gambiteer',
    name: 'Gambiteer',
    description: 'Start with -0.5 Eval, but gain +20% Tactics Power globally.',
    cost: 1,
    category: 'Opening'
  },

  // Category B: Midgame
  {
    id: 'counter_play',
    name: 'Counter-Play',
    description: 'If losing (< 0 Eval) at Move 11, gain +15% Midgame Power.',
    cost: 1,
    category: 'Midgame'
  },
  {
    id: 'knight_outpost',
    name: 'Knight Outpost',
    description: 'Flat +10% Power to Midgame Stat.',
    cost: 1,
    category: 'Midgame'
  },
  {
    id: 'complex_positions',
    name: 'Complex Positions',
    description: 'Increases Random Variance for BOTH players (0.85-1.15).',
    cost: 1,
    category: 'Midgame'
  },
  {
    id: 'tempo_gain',
    name: 'Tempo Gain',
    description: 'At Move 25, Enemy Power is halved (0.5x) for one turn.',
    cost: 1,
    category: 'Midgame'
  },
  {
    id: 'battery_attack',
    name: 'Battery Attack',
    description: 'If you won Phase 1, Midgame Power +10%.',
    cost: 1,
    category: 'Midgame'
  },
  {
    id: 'positional_squeeze',
    name: 'Positional Squeeze',
    description: 'Moves in your favor move the bar 10% more.',
    cost: 1,
    category: 'Midgame'
  },

  // Category C: Sacrifices
  {
    id: 'sound_sacrifice',
    name: 'Sound Sacrifice',
    description: 'Failed sacrifices (negative swing) deal half damage.',
    cost: 1,
    category: 'Sacrifices'
  },
  {
    id: 'tals_spirit',
    name: 'Tal\'s Spirit',
    description: 'Increases max sacrifice roll from +2.0 to +3.5.',
    cost: 1,
    category: 'Sacrifices'
  },
  {
    id: 'desperado',
    name: 'Desperado',
    description: 'If Eval < -3.0, Sacrifice Effectiveness is doubled.',
    cost: 1,
    category: 'Sacrifices'
  },
  {
    id: 'greek_gift',
    name: 'Greek Gift',
    description: 'At Move 20, 30% chance to add +2.0 to Evaluation.',
    cost: 1,
    category: 'Sacrifices'
  },
  {
    id: 'chaos_theory',
    name: 'Chaos Theory',
    description: 'Sacrifice Swing scales with Enemy Tier (Elo/500).',
    cost: 1,
    category: 'Sacrifices'
  },

  // Category D: Tactics
  {
    id: 'calculation',
    name: 'Calculation',
    description: 'Flat +5% Power to Tactics Stat.',
    cost: 1,
    category: 'Tactics'
  },
  {
    id: 'pin',
    name: 'Pin',
    description: 'In Midgame, 20% chance to negate an enemy move.',
    cost: 1,
    category: 'Tactics'
  },
  {
    id: 'fork',
    name: 'Fork',
    description: 'Winning moves get an extra +0.1 bonus.',
    cost: 1,
    category: 'Tactics'
  },
  {
    id: 'mate_net',
    name: 'Mate Net',
    description: 'Win Condition reduced to +8.0.',
    cost: 1,
    category: 'Tactics'
  },

  // Category E: Endgame
  {
    id: 'fortress',
    name: 'Fortress',
    description: 'If losing in Endgame (-2 to -5), Draw chance increases to 40%.',
    cost: 1,
    category: 'Endgame'
  },
  {
    id: 'tablebase',
    name: 'Tablebase',
    description: 'If winning (> +1.0) at Move 40, Enemy plays perfectly (no random).',
    cost: 1,
    category: 'Endgame'
  },
  {
    id: 'zugzwang',
    name: 'Zugzwang',
    description: 'Every turn in Endgame, Enemy Power drops by 1% cumulatively.',
    cost: 1,
    category: 'Endgame'
  },
  {
    id: 'lucena_position',
    name: 'Lucena Position',
    description: 'If Winning, bar moves 5% faster.',
    cost: 1,
    category: 'Endgame'
  },
  {
    id: 'philidor_position',
    name: 'Philidor Position',
    description: 'If Losing, bar moves 5% slower.',
    cost: 1,
    category: 'Endgame'
  }
];

export const getSkillById = (id) => SKILLS.find(s => s.id === id);
