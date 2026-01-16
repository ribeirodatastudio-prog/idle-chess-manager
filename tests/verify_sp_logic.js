// Mock Data and Functions
const TIERS_PER_TOURNAMENT = 3;

// Mock Helper functions from useGameState.js
const calculateTotalTiersCleared = (ranks) => {
    let total = 0;
    // Mocking GAME_MODES iteration
    const modes = ['rapid', 'blitz', 'bullet', 'classical', 'chess960'];
    modes.forEach(modeId => {
        const r = ranks[modeId];
        if (typeof r === 'object') {
             total += (r.tournamentIndex * TIERS_PER_TOURNAMENT) + r.tierIndex;
        }
    });
    return total;
};

// Simplified Used SP Calc (just sums a mocked 'used' value)
const calculateUsedStudyPoints = (skills) => {
    return skills._mockUsedSP || 0;
};

// The Logic Under Test
function runRetroactiveCheck(context) {
    const { tournament, puzzleStats, skills, resources, setResources } = context;

    // Calculate expected total SP based on Tiers Cleared + Solved Puzzles
    const tiersSP = calculateTotalTiersCleared(tournament.ranks);
    const solvedSP = puzzleStats.solvedCount || 0;
    const expectedSP = tiersSP + solvedSP;

    // Calculate current total SP (Available + Used)
    const currentUsedSP = calculateUsedStudyPoints(skills);
    const currentAvailableSP = resources.studyPoints || 0;
    const currentTotalSP = currentAvailableSP + currentUsedSP;

    console.log(`   [Check] TiersSP: ${tiersSP}, SolvedSP: ${solvedSP} => Expected: ${expectedSP}`);
    console.log(`   [Check] AvailSP: ${currentAvailableSP}, UsedSP: ${currentUsedSP} => Current: ${currentTotalSP}`);

    // If we have less SP than we should, grant the difference
    if (currentTotalSP < expectedSP) {
        const diff = expectedSP - currentTotalSP;
        console.log(`   [Action] Granting ${diff} SP`);
        setResources(prev => ({
            ...prev,
            studyPoints: (prev.studyPoints || 0) + diff
        }));
        return diff;
    }
    console.log(`   [Action] None (Balanced)`);
    return 0;
}

// Test Runner
console.log("Running SP Logic Verification...");

// Initialize Default State
const getBaseState = () => ({
    tournament: {
        ranks: {
            rapid: { tournamentIndex: 0, tierIndex: 0 },
            blitz: { tournamentIndex: 0, tierIndex: 0 },
            bullet: { tournamentIndex: 0, tierIndex: 0 },
            classical: { tournamentIndex: 0, tierIndex: 0 },
            chess960: { tournamentIndex: 0, tierIndex: 0 }
        }
    },
    puzzleStats: { solvedCount: 0 },
    skills: { _mockUsedSP: 0 },
    resources: { studyPoints: 0 },
    setResources: (cb) => {
        // Mock State Update
        const prev = context.resources;
        const next = cb(prev);
        context.resources = next;
    }
});

let context = getBaseState();
let failed = false;

// Case 1: Ideal Solve
console.log("\nCase 1: Ideal Puzzle Solve (Manual Add + Logic Check)");
context = getBaseState();
// Action: Solve Puzzle
context.puzzleStats.solvedCount = 1; // Solved + 1
context.resources.studyPoints = 1;   // Manual Add + 1
// Check
const added1 = runRetroactiveCheck(context);
if (added1 !== 0) { console.error("FAILED: Should not add extra SP."); failed = true; }
else console.log("PASSED");

// Case 2: Retroactive Solve (Missing Manual Add)
console.log("\nCase 2: Retroactive Puzzle Solve (Missing Manual Add)");
context = getBaseState();
// Action: Solve Puzzle but FORGET to add SP
context.puzzleStats.solvedCount = 1;
context.resources.studyPoints = 0;
// Check
const added2 = runRetroactiveCheck(context);
if (added2 !== 1) { console.error(`FAILED: Should add 1 SP. Added ${added2}`); failed = true; }
else if (context.resources.studyPoints !== 1) { console.error("FAILED: State not updated."); failed = true; }
else console.log("PASSED");

// Case 3: Ideal Tier Clear
console.log("\nCase 3: Ideal Tier Clear");
context = getBaseState();
// Action: Clear Tier 0 -> Tier 1
context.tournament.ranks.rapid.tierIndex = 1;
context.resources.studyPoints = 1; // Manual Add
// Check
const added3 = runRetroactiveCheck(context);
if (added3 !== 0) { console.error("FAILED: Should not add extra SP."); failed = true; }
else console.log("PASSED");

// Case 4: Retroactive Tier Clear
console.log("\nCase 4: Retroactive Tier Clear");
context = getBaseState();
// Action: Clear Tier
context.tournament.ranks.rapid.tierIndex = 1;
context.resources.studyPoints = 0; // Forgot Manual Add
// Check
const added4 = runRetroactiveCheck(context);
if (added4 !== 1) { console.error("FAILED: Should add 1 SP."); failed = true; }
else console.log("PASSED");

// Case 5: Spending SP
console.log("\nCase 5: Spending SP");
context = getBaseState();
context.tournament.ranks.rapid.tierIndex = 5; // Total 5 SP earned
context.resources.studyPoints = 5; // Have 5
// Check Base
runRetroactiveCheck(context);
// Action: Buy Skill (Cost 2)
context.resources.studyPoints = 3;
context.skills._mockUsedSP = 2;
// Check
const added5 = runRetroactiveCheck(context);
if (added5 !== 0) { console.error("FAILED: Should remain balanced."); failed = true; }
else console.log("PASSED");


if (failed) {
    console.error("\nSP Logic Verification FAILED.");
    process.exit(1);
} else {
    console.log("\nSP Logic Verification PASSED.");
}
