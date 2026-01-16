const MATCHES_PER_TIER = 3;

function runPrizeLogic(rank, currentIncome) {
    const isTierClear = (rank.matchIndex + 1) === MATCHES_PER_TIER;

    let prizeSeconds = 60; // Base Match Win
    let spAward = 0;

    if (isTierClear) {
        prizeSeconds += 600; // Bonus
        spAward = 1;
    }

    const totalReward = currentIncome * prizeSeconds;

    return {
        isTierClear,
        prizeSeconds,
        totalReward,
        spAward
    };
}

console.log("Running Prize Logic Verification...");
let failed = false;

// Case 1: Regular Match Win (Match 0)
const case1 = runPrizeLogic({ matchIndex: 0 }, 10.0);
console.log(`Case 1 (Match 0): PrizeSeconds=${case1.prizeSeconds}, SP=${case1.spAward}`);
if (case1.prizeSeconds !== 60) { console.error("FAILED Case 1: Expected 60s."); failed = true; }
if (case1.spAward !== 0) { console.error("FAILED Case 1: Expected 0 SP."); failed = true; }

// Case 2: Tier Clear Win (Match 2, if MatchesPerTier is 3)
const case2 = runPrizeLogic({ matchIndex: 2 }, 10.0);
console.log(`Case 2 (Match 2): PrizeSeconds=${case2.prizeSeconds}, SP=${case2.spAward}`);
if (case2.prizeSeconds !== 660) { console.error("FAILED Case 2: Expected 660s (60+600)."); failed = true; }
if (case2.spAward !== 1) { console.error("FAILED Case 2: Expected 1 SP."); failed = true; }

if (failed) {
    console.error("Prize Verification FAILED.");
    process.exit(1);
} else {
    console.log("Prize Verification PASSED.");
}
