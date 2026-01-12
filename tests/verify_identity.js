import { getOpponentIdentity } from '../src/logic/identity.js';

console.log("Verifying Identity Logic...");

// 1. Test Opening Master
const openingStats = { opening: 50, midgame: 10, endgame: 10, tactics: 10, sacrifices: 10 };
const id1 = getOpponentIdentity(openingStats);
console.log("Stats: Opening High -> Identity:", id1);
if (id1.title === "Opening Master" && id1.color.includes("purple")) {
    console.log("PASS: Opening Master detected.");
} else {
    console.error("FAIL: Expected Opening Master.");
}

// 2. Test Tactics (Little Tal)
const tacticStats = { opening: 10, midgame: 10, endgame: 10, tactics: 50, sacrifices: 10 };
const id2 = getOpponentIdentity(tacticStats);
console.log("Stats: Tactics High -> Identity:", id2);
if (id2.title === "Little Tal" && id2.color.includes("red")) {
    console.log("PASS: Little Tal detected.");
} else {
    console.error("FAIL: Expected Little Tal.");
}

// 3. Test Balanced (Solid Club Player)
// Max = 20. Min = 19. Spread = 1. 1/20 = 0.05 (< 0.1).
const balancedStats = { opening: 20, midgame: 20, endgame: 20, tactics: 19, sacrifices: 20 };
const id3 = getOpponentIdentity(balancedStats);
console.log("Stats: Balanced -> Identity:", id3);
if (id3.title === "Solid Club Player") {
    console.log("PASS: Solid Club Player detected.");
} else {
    console.error("FAIL: Expected Solid Club Player. Got: " + id3.title);
}
