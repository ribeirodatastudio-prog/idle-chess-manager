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
        default:
            return {
                title: "Unknown Player",
                hint: "A mysterious opponent.",
                color: "text-gray-400"
            };
    }
};
