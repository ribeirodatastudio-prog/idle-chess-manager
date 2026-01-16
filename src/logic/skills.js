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
    tier: 0,
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
    tier: 0,
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
    tier: 0,
    isHidden: true
  },
  // Tier 1: Opening Tree
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
    isHidden: true
  },
  // Tier 2: Opening Tree
  {
    id: 'op_extender',
    name: 'Opening Extender',
    description: 'Extends Opening phase by 1 move per level.',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'op_caro',
    name: 'The Caro-Kann',
    description: 'Start the game with +0.1 Eval per level.',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'op_gambit',
    name: 'Opening Gambit',
    description: 'Guaranteed Sacrifice attempt on Turn 5. (Does not consume Max Sacrifice cap).',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 1,
    tier: 2,
    isHidden: true
  },
  // Tier 3: Opening Tree (NEW)
  {
    id: 'op_novelty',
    name: 'Prepared Novelty',
    description: 'Debuff: Enemy Opening Stats -3% per level.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 3,
    tier: 3,
    isHidden: true
  },
  {
    id: 'op_space',
    name: 'Space Advantage',
    description: 'Momentum: If Opening Eval > 0, +4% All Stats in Midgame per level.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_opening',
    maxLevel: 3,
    tier: 3,
    isHidden: true
  },
  // Tier 1: Midgame Tree
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
    isHidden: true
  },
  // Tier 2: Midgame Tree
  {
    id: 'mid_extender',
    name: 'Midgame Extender',
    description: 'Extends Midgame phase by 1 move per level.',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'mid_boost',
    name: 'Positional Mastery',
    description: 'Instantly gain +0.1 Eval when Midgame starts per level.',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'mid_gambit',
    name: 'Midgame Complication',
    description: 'Guaranteed Sacrifice attempt on Turn 25. (Does not consume Max Sacrifice cap).',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 1,
    tier: 2,
    isHidden: true
  },
  // Tier 3: Midgame Tree (NEW)
  {
    id: 'mid_cloud',
    name: 'Tactical Cloud',
    description: 'Debuff: Enemy Tactics -3% per level during Midgame.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 3,
    tier: 3,
    isHidden: true
  },
  {
    id: 'mid_simplify',
    name: 'Simplification',
    description: 'Momentum: If Midgame Eval > 0, +4% All Stats in Endgame per level.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_midgame',
    maxLevel: 3,
    tier: 3,
    isHidden: true
  },
  // Tier 1: Endgame Tree
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
    tier: 1,
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
    tier: 1,
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
    tier: 1,
    isHidden: true
  },
  // Tier 2: Endgame Tree
  {
    id: 'end_extender',
    name: 'Endgame Extender',
    description: 'Extends TOTAL Game Duration by 1 move per level (Max 53 turns).',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'end_boost',
    name: 'Conversion Technique',
    description: 'Instantly gain +0.1 Eval when Endgame starts per level.',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 3,
    tier: 2,
    isHidden: true
  },
  {
    id: 'end_gambit',
    name: 'The Breakthrough',
    description: 'Guaranteed Sacrifice attempt on Turn 35. (Does not consume Max Sacrifice cap).',
    cost: 0,
    spCost: 10,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 1,
    tier: 2,
    isHidden: true
  },
  // Tier 3: Endgame Tree (NEW)
  {
    id: 'end_tablebase',
    name: 'Tablebase Memory',
    description: 'Debuff: Enemy Defense -3% per level during Endgame.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 3,
    tier: 3,
    isHidden: true
  },
  {
    id: 'end_zugzwang',
    name: 'Zugzwang Squeeze',
    description: 'Enemy stats decay 1% per turn (cumulative) after move 30.',
    cost: 0,
    spCost: 15,
    costType: 'SP',
    category: 'Phase Mastery',
    parentId: 'study_endgame',
    maxLevel: 3,
    tier: 3,
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
    group: 'instinct_path',
    isHidden: true
  },
  {
    id: 'instinct_defense',
    name: 'Iron Will',
    description: 'Defense Stat x1.1 (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    group: 'instinct_path',
    isHidden: true
  },
  {
    id: 'instinct_risk',
    name: 'Gambler\'s Instinct',
    description: 'Sacrifice Trigger Chance x1.1 (+10% frequency) (Matches Only)',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    group: 'instinct_path',
    isHidden: true
  },
  // Tier 2: Instinct Tactics Tree
  {
    id: 'inst_tac_op',
    name: 'Opening Sharpness',
    description: '+1% Tactics per level during Opening',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_tactics',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_tac_mid',
    name: 'Midgame Combinations',
    description: '+1% Tactics per level during Midgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_tactics',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_tac_end',
    name: 'Endgame Precision',
    description: '+1% Tactics per level during Endgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_tactics',
    maxLevel: 5,
    isHidden: true
  },
  // Tier 2: Instinct Defense Tree
  {
    id: 'inst_def_op',
    name: 'Solid Opening',
    description: '+1% Defense per level during Opening',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_defense',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_def_mid',
    name: 'Resilient Midgame',
    description: '+1% Defense per level during Midgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_defense',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_def_end',
    name: 'Endgame Wall',
    description: '+1% Defense per level during Endgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_defense',
    maxLevel: 5,
    isHidden: true
  },
  // Tier 2: Instinct Risk Tree
  {
    id: 'inst_sac_op',
    name: 'Early Gambits',
    description: '+1% Flat Sacrifice Chance per level during Opening',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_risk',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_sac_mid',
    name: 'Middle Attack',
    description: '+1% Flat Sacrifice Chance per level during Midgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_risk',
    maxLevel: 5,
    isHidden: true
  },
  {
    id: 'inst_sac_end',
    name: 'Final Desperation',
    description: '+1% Flat Sacrifice Chance per level during Endgame',
    cost: 0,
    spCost: 1,
    costType: 'SP',
    category: 'Instinct Focus',
    parentId: 'instinct_risk',
    maxLevel: 5,
    isHidden: true
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

// Helper: Get Level
const getLevel = (skills, id) => {
    const val = skills[id];
    if (typeof val === 'number') return val;
    return val ? 1 : 0;
};

// Helper: Get Tier Unlock Status
export const getBranchTierStatus = (branch, ownedSkills) => {
    // Branch: 'opening', 'midgame', 'endgame'
    // Map branch to Parent ID
    const parentId = `study_${branch}`;

    // Tier 1 Skills: Children of Parent with Tier 1
    const tier1Skills = SKILLS.filter(s => s.parentId === parentId && s.tier === 1);

    // Tier 2 Skills: Children of Parent with Tier 2
    const tier2Skills = SKILLS.filter(s => s.parentId === parentId && s.tier === 2);

    // Calculate Total Levels
    const tier1Levels = tier1Skills.reduce((sum, skill) => sum + getLevel(ownedSkills, skill.id), 0);
    const tier2Levels = tier2Skills.reduce((sum, skill) => sum + getLevel(ownedSkills, skill.id), 0);

    return {
        tier2Unlocked: tier1Levels >= 5,
        tier3Unlocked: tier2Levels >= 1
    };
};

// Helper: Calculate Academic Tenure Multiplier
export const calculateTenureMultiplier = (ownedSkills) => {
    // Sum levels of ALL skills in 'Study Focus' category OR 'study_path' group (for roots)
    // Actually, checking categories 'Study Focus' (Roots) and 'Phase Mastery' (Children) is safest.

    let totalLevels = 0;

    Object.keys(ownedSkills).forEach(skillId => {
        const skill = getSkillById(skillId);
        if (skill) {
             // Root Skills (Tier 0) -> Category: 'Study Focus'
             // Child Skills (Tier 1-3) -> Category: 'Phase Mastery'
             if (skill.category === 'Study Focus' || skill.category === 'Phase Mastery') {
                 totalLevels += getLevel(ownedSkills, skillId);
             }
        }
    });

    return Math.pow(1.05, totalLevels);
};
