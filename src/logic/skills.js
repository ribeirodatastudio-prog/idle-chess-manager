export const SKILLS = [
  {
    id: 'time_trouble',
    name: 'Time Trouble',
    description: 'Cumulative enemy debuff in late game (Moves 35+).',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  {
    id: 'lasker_defense',
    name: 'Lasker\'s Defense',
    description: 'Double evaluation recovery if losing after Move 20.',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  {
    id: 'brilliant_bounty',
    name: 'Brilliant Move Bounty',
    description: 'Gain 10 mins of Study Time upon a successful Sacrifice event.',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  {
    id: 'deep_blue',
    name: 'Deep Blue Calculation',
    description: 'Player Power scales exponentially (1.02 ^ MoveNumber).',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  {
    id: 'decisive_blow',
    name: 'Decisive Blow',
    description: 'Win/Lose Threshold reduced to +/- 5.0 (Faster games, higher risk).',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  {
    id: 'iron_curtain',
    name: 'Iron Curtain',
    description: '-50% Attack, +40% Defense. Survival at Move 50 counts as a WIN.',
    cost: 1,
    spCost: 0,
    costType: 'AP',
    category: 'Mechanic'
  },
  // Path A: Study Focus (Phase Parents)
  {
    id: 'study_opening',
    name: 'Opening Specialist',
    description: 'Opening Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Study Focus',
    group: 'study_path',
    isHidden: true
  },
  {
    id: 'study_midgame',
    name: 'Midgame Maestro',
    description: 'Midgame Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Study Focus',
    group: 'study_path',
    isHidden: true
  },
  {
    id: 'study_endgame',
    name: 'Endgame Virtuoso',
    description: 'Endgame Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Study Focus',
    group: 'study_path',
    isHidden: true
  },
  // Tier 2: Opening Tree
  {
    id: 'op_def_master',
    name: 'Opening Defense',
    description: 'Opening Phase: Defense x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'op_tac_master',
    name: 'Opening Tactics',
    description: 'Opening Phase: Tactics x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'op_sac_master',
    name: 'Opening Risks',
    description: 'Opening Phase: Sacrifice Chance +1%/Lvl',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 5,
    isHidden: true
  },
  // Tier 2: Midgame Tree
  {
    id: 'mid_def_master',
    name: 'Midgame Defense',
    description: 'Midgame Phase: Defense x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'mid_tac_master',
    name: 'Midgame Tactics',
    description: 'Midgame Phase: Tactics x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'mid_sac_master',
    name: 'Midgame Risks',
    description: 'Midgame Phase: Sacrifice Chance +1%/Lvl',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 5,
    isHidden: true
  },
  // Tier 2: Endgame Tree
  {
    id: 'end_def_master',
    name: 'Endgame Defense',
    description: 'Endgame Phase: Defense x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'end_tac_master',
    name: 'Endgame Tactics',
    description: 'Endgame Phase: Tactics x (1 + 0.1/Lvl)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'end_sac_master',
    name: 'Endgame Risks',
    description: 'Endgame Phase: Sacrifice Chance +1%/Lvl',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 5,
    isHidden: true
  },
  // Path B: Instinct Focus
  {
    id: 'instinct_tactics',
    name: 'Tactical Eye',
    description: 'Tactics Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    group: 'instinct_path'
  },
  {
    id: 'instinct_defense',
    name: 'Iron Will',
    description: 'Defense Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    group: 'instinct_path'
  },
  {
    id: 'instinct_risk',
    name: 'Gambler\'s Instinct',
    description: 'Sacrifice Trigger Chance x1.1 (+10% frequency) (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    group: 'instinct_path'
  },
  // Standalone
  {
    id: 'chaos_theory',
    name: 'Chaos Theory',
    description: 'Doubles (2x) the base Sacrifice Chance for the player in all modes.',
    cost: 2,
    spCost: 0,
    costType: 'AP',
    category: 'Special'
  }
];

export const getSkillById = (id) => SKILLS.find(s => s.id === id);
