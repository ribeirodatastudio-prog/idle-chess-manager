const { getOpponentIdentity } = require('../src/logic/identity.js');

console.log("=== Verifying Identity Logic ===");

const defenseStats = {
    opening: 10,
    midgame: 10,
    endgame: 10,
    tactics: 10,
    sacrifices: 10,
    defense: 50
};

const identity = getOpponentIdentity(defenseStats);
console.log(`Title: ${identity.title}`);
console.log(`Hint: ${identity.hint}`);
console.log(`Color: ${identity.color}`);

if (identity.title === "The Swindler" && identity.color === "text-cyan-400") {
    console.log("PASS: Defense Identity Correct.");
} else {
    console.error("FAIL: Defense Identity Incorrect.");
}
