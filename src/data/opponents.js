const OPPONENT_ARCHETYPES = [
    {
        "Apelido": "The Grand Theorist",
        "Opening": "35%",
        "Midgame": "30%",
        "Tooltip": "If you stray from theory in the opening, he will crush you positionally in the middlegame."
    },
    {
        "Apelido": "The Long Planner",
        "Opening": "35%",
        "Endgame": "30%",
        "Tooltip": "He plays the opening solely to create a winning pawn structure for the endgame."
    },
    {
        "Apelido": "The Opening Trap",
        "Opening": "35%",
        "Tactics": "30%",
        "Tooltip": "Has memorized sharp lines and traps. One mistake in the first 10 moves and you might get checkmated."
    },
    {
        "Apelido": "The Gambiteer",
        "Opening": "35%",
        "Sacrifice": "30%",
        "Tooltip": "Will offer pawns in the opening to gain time and attack. Do not accept everything blindly."
    },
    {
        "Apelido": "The Iron Book",
        "Opening": "35%",
        "Defense": "30%",
        "Tooltip": "Impossible to surprise in the opening. Plays solidly and takes no unnecessary risks."
    },
    {
        "Apelido": "The Flow Master",
        "Midgame": "35%",
        "Opening": "30%",
        "Tooltip": "Transitions perfectly from the opening and dominates piece coordination as soon as the center opens up."
    },
    {
        "Apelido": "The Boa Constrictor",
        "Midgame": "35%",
        "Endgame": "30%",
        "Tooltip": "Gradually takes away your space in the middlegame until you suffocate, converting into an easy endgame."
    },
    {
        "Apelido": "The Eagle Eye",
        "Midgame": "35%",
        "Tactics": "30%",
        "Tooltip": " amid complexity, he sees tactics no one else sees. Do not leave any pieces undefended."
    },
    {
        "Apelido": "The Chaos Agent",
        "Midgame": "35%",
        "Sacrifice": "30%",
        "Tooltip": "He will set the board on fire around move 20. Prepare to defend against irrational attacks."
    },
    {
        "Apelido": "The Prophylactic",
        "Midgame": "35%",
        "Defense": "30%",
        "Tooltip": "He predicts and neutralizes your plans before you even try to execute them. Frustrating and solid."
    },
    {
        "Apelido": "The Berlin Wall",
        "Endgame": "35%",
        "Opening": "30%",
        "Tooltip": "Seeks to trade pieces as fast as possible to reach an endgame where he dominates technically."
    },
    {
        "Apelido": "The Machine",
        "Endgame": "35%",
        "Midgame": "30%",
        "Tooltip": "Plays like a computer. If you reach the endgame with even a slight disadvantage, you have already lost."
    },
    {
        "Apelido": "The Trickster",
        "Endgame": "35%",
        "Tactics": "30%",
        "Tooltip": "Do not relax in the endgame. He will find a perpetual check or a fork when you least expect it."
    },
    {
        "Apelido": "The Desperate",
        "Endgame": "35%",
        "Sacrifice": "30%",
        "Tooltip": "Will sacrifice his last piece to promote a pawn. Calculate promotion races carefully."
    },
    {
        "Apelido": "The Survivor",
        "Endgame": "35%",
        "Defense": "30%",
        "Tooltip": "This opponent refuses to lose, holding miraculous draws in theoretically lost positions."
    },
    {
        "Apelido": "The Aggressor",
        "Tactics": "35%",
        "Opening": "30%",
        "Tooltip": "Total attack from move 1. If your defense is not sharp, the game will end quickly."
    },
    {
        "Apelido": "The Combinator",
        "Tactics": "35%",
        "Midgame": "30%",
        "Tooltip": "Master of long attacking sequences. Avoid positions that are too open against him."
    },
    {
        "Apelido": "The Sniper",
        "Tactics": "35%",
        "Endgame": "30%",
        "Tooltip": "Calculates long and precise mating variations, even with very few pieces on the board."
    },
    {
        "Apelido": "The Berserker",
        "Tactics": "35%",
        "Sacrifice": "30%",
        "Tooltip": "Does not care about material, only about the enemy King. Imminent suicide attack."
    },
    {
        "Apelido": "The Counter-Puncher",
        "Tactics": "35%",
        "Defense": "30%",
        "Tooltip": "Waits patiently for you to attack so he can use the force of your own blow against you."
    },
    {
        "Apelido": "The Romantic",
        "Sacrifice": "35%",
        "Opening": "30%",
        "Tooltip": "19th-century style. Plays obscure gambits and gives up pieces for initiative right at the start."
    },
    {
        "Apelido": "The Talisman",
        "Sacrifice": "35%",
        "Midgame": "30%",
        "Tooltip": "Pure intuition. Makes sacrifices that look wrong but are extremely hard to refute in practice."
    },
    {
        "Apelido": "The Magician",
        "Sacrifice": "35%",
        "Endgame": "30%",
        "Tooltip": "Creates mating nets out of thin air, often sacrificing his last remaining pieces."
    },
    {
        "Apelido": "The Wildcard",
        "Sacrifice": "35%",
        "Tactics": "30%",
        "Tooltip": "The most unpredictable opponent. The board will turn into a chaos of captured pieces."
    },
    {
        "Apelido": "The Swindler",
        "Sacrifice": "35%",
        "Defense": "30%",
        "Tooltip": "When losing, he gives up material on purpose to create confusion and save the game."
    },
    {
        "Apelido": "The Bunker",
        "Defense": "35%",
        "Opening": "30%",
        "Tooltip": "Builds a fortress right in the opening that is very difficult to break."
    },
    {
        "Apelido": "The Blockader",
        "Defense": "35%",
        "Midgame": "30%",
        "Tooltip": "Blockades your pawns and closes the files. The game tends to be slow and locked."
    },
    {
        "Apelido": "The Fortress Builder",
        "Defense": "35%",
        "Endgame": "30%",
        "Tooltip": "Constructs impregnable positions. You might have material advantage, but you won't get in."
    },
    {
        "Apelido": "The Hedgehog",
        "Defense": "35%",
        "Tactics": "30%",
        "Tooltip": "Stays curled up behind his pawns, but has poisonous spikes if you get too close."
    },
    {
        "Apelido": "The Rubber Wall",
        "Defense": "35%",
        "Sacrifice": "30%",
        "Tooltip": "Absorbs everything and returns material at the exact right moment to neutralize your attack."
    }
];

const STAT_MAPPING = {
  "Opening": "opening",
  "Midgame": "midgame",
  "Endgame": "endgame",
  "Tactics": "tactics",
  "Sacrifice": "sacrifices",
  "Defense": "defense"
};

export const OPPONENTS = OPPONENT_ARCHETYPES.map(arch => {
  const keys = Object.keys(arch);
  let skill1 = '';
  let skill2 = '';

  for (const key of keys) {
      if (key === 'Apelido' || key === 'Tooltip') continue;

      const val = arch[key];
      if (val === '35%') {
          skill1 = STAT_MAPPING[key];
      } else if (val === '30%') {
          skill2 = STAT_MAPPING[key];
      }
  }

  // Fallback for safety if skills not found (should not happen with valid JSON)
  if (!skill1 || !skill2) {
      console.warn("Missing skills for archetype:", arch.Apelido);
  }

  return {
    id: arch.Apelido,
    skill1,
    skill2,
    tooltip: arch.Tooltip
  };
});
