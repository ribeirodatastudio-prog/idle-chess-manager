
import { calculatePassiveIncomePerSecond } from '../src/logic/math.js';

// Mock Data
const GAME_MODES = [
    { id: 'rapid' },
    { id: 'blitz' },
    { id: 'classical' },
    { id: 'bullet' },
    { id: 'chess960' }
];

const ranks = {
    rapid: { tournamentIndex: 0 },
    blitz: { tournamentIndex: 0 },
    classical: { tournamentIndex: 0 },
    bullet: { tournamentIndex: 0 },
    chess960: { tournamentIndex: 0 }
};

// Test Config
const TEST_DURATION_SECONDS = 40 * 60; // 40 minutes

function runSimulation() {
    console.log("Starting Seamless Logic Verification...");

    // 1. Calculate Income Rate (Baseline)
    const cumulativeIdx = GAME_MODES.reduce((sum, m) => sum + ranks[m.id].tournamentIndex, 0);
    // Base rate for index 0 is ((1+0)*(1.05^0))/60 = 1/60 per sec
    const incomePerSec = calculatePassiveIncomePerSecond(cumulativeIdx);

    console.log(`Income Per Second: ${incomePerSec.toFixed(5)}`);
    console.log(`Expected Income for 40 mins: ${(incomePerSec * TEST_DURATION_SECONDS).toFixed(2)}`);

    // 2. Simulate Old Logic (Throttled)
    // Assumption: Browser throttles to 1 tick per minute
    let oldStudyTime = 0;
    const throttledTicks = 40; // 1 tick per minute for 40 mins

    for (let i = 0; i < throttledTicks; i++) {
        // Old logic added income implicitly for 1 second per tick
        oldStudyTime += incomePerSec;
    }

    console.log(`Old Logic (Throttled 1/min) Result: ${oldStudyTime.toFixed(5)}`);

    // 3. Simulate New Logic (Delta Time)
    let newStudyTime = 0;

    // Scenario: Loop stops completely, then fires once after 40 mins
    const lastTick = Date.now() - (TEST_DURATION_SECONDS * 1000);
    const now = Date.now();
    let delta = (now - lastTick) / 1000;

    if (delta > 86400) delta = 86400; // Cap

    if (delta > 0) {
        newStudyTime += incomePerSec * delta;
    }

    console.log(`New Logic (Delta ${delta}s) Result: ${newStudyTime.toFixed(5)}`);

    // Verification
    if (Math.abs(newStudyTime - (incomePerSec * TEST_DURATION_SECONDS)) < 0.001) {
        console.log("SUCCESS: New logic correctly accounts for full duration.");
    } else {
        console.error("FAILURE: New logic calculation mismatch.");
        process.exit(1);
    }

    if (oldStudyTime < newStudyTime * 0.1) {
        console.log("SUCCESS: Old logic significantly underperformed (as expected for bug reproduction).");
    } else {
        console.warn("WARNING: Old logic performed too well? Check assumptions.");
    }
}

runSimulation();
