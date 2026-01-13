export const getOpponentIdentity = (stats) => {
    // Find the highest stat
    let maxVal = -1;
    let maxKey = '';
    let minVal = Infinity;

    // Also track total for average? No, just spread.
    Object.entries(stats).forEach(([key, val]) => {
        if (val > maxVal) {
            maxVal = val;
            maxKey = key;
        }
        if (val < minVal) {
            minVal = val;
        }
    });

    // Check for balance (Spread < 10% of max)
    const spread = maxVal - minVal;
    const isBalanced = (spread / maxVal) < 0.1;

    if (isBalanced) {
        return {
            title: "Solid Club Player",
            hint: "No clear weaknesses.",
            color: "text-gray-300"
        };
    }

    switch (maxKey) {
        case 'opening':
            return {
                title: "Opening Master",
                hint: "Extremely dangerous in the first 10 moves.",
                color: "text-purple-400"
            };
        case 'midgame':
            return {
                title: "Midgame Maestro",
                hint: "Dominates the board center. Strong Phase 2.",
                color: "text-blue-400"
            };
        case 'endgame':
            return {
                title: "Carlsen's Student",
                hint: "Deadly precision if the game goes long.",
                color: "text-green-400"
            };
        case 'tactics':
            return {
                title: "Little Tal",
                hint: "Sharp tactical vision. Will punish loose pieces.",
                color: "text-red-500"
            };
        case 'sacrifices':
            return {
                title: "Nezhmetdinov",
                hint: "Aggressive! Will give up material for an attack.",
                color: "text-orange-500"
            };
        case 'defense':
            return {
                title: "Hikaru Nakamura", // Or "The Swindler" per prompt, but prompt said "Hikaru Nakamura (or The Swindler)". I'll use Hikaru as primary. Wait, prompt instructions: "Assign Title: 'Hikaru Nakamura' (or 'The Swindler')". I will use 'The Swindler' to be safe on generic naming? No, 'Hikaru Nakamura' is iconic. I'll use 'The Swindler' as the title per the specific Action Step 8 plan text which I wrote as 'The Swindler'. Let's stick to the Plan: 'The Swindler'.
                title: "The Swindler",
                hint: "Legendary Defense! Hard to break down.",
                color: "text-cyan-400"
            };
        default:
            return {
                title: "Unknown Player",
                hint: "A mysterious opponent.",
                color: "text-gray-400"
            };
    }
};
