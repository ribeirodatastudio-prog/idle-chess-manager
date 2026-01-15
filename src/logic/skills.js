export const SKILLS = [
  {
    id: 'time_trouble',
    name: 'Time Trouble',
    description: 'Cumulative enemy debuff in late game (Moves 35+).',
    cost: 1,
    category: 'Mechanic'
  },
  {
    id: 'lasker_defense',
    name: 'Lasker\'s Defense',
    description: 'Double evaluation recovery if losing after Move 20.',
    cost: 1,
    category: 'Mechanic'
  },
  {
    id: 'brilliant_bounty',
    name: 'Brilliant Move Bounty',
    description: 'Gain 10 mins of Study Time upon a successful Sacrifice event.',
    cost: 1,
    category: 'Mechanic'
  },
  {
    id: 'deep_blue',
    name: 'Deep Blue Calculation',
    description: 'Player Power scales exponentially (1.02 ^ MoveNumber).',
    cost: 1,
    category: 'Mechanic'
  },
  {
    id: 'decisive_blow',
    name: 'Decisive Blow',
    description: 'Win/Lose Threshold reduced to +/- 5.0 (Faster games, higher risk).',
    cost: 1,
    category: 'Mechanic'
  },
  {
    id: 'iron_curtain',
    name: 'Iron Curtain',
    description: '-50% Attack, +40% Defense. Survival at Move 50 counts as a WIN.',
    cost: 1,
    category: 'Mechanic'
  }
];

export const getSkillById = (id) => SKILLS.find(s => s.id === id);
