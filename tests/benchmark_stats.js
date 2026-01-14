
import { generateOpponentStats } from '../src/logic/simulation.js';
import { performance } from 'perf_hooks';

console.log("=== OPPONENT GENERATION BENCHMARK ===");

const runBenchmark = (name, rankData) => {
    console.log(`\nRunning: ${name}`);

    const start = performance.now();
    const result = generateOpponentStats(rankData);
    const end = performance.now();

    console.log(`Time: ${(end - start).toFixed(4)} ms`);
    console.log(`Total Power (Elo): ${result.totalPower.toLocaleString()}`);
    console.log(`Raw Stats Sum: ${result.rawStatsSum.toLocaleString()}`);
    console.log(`Sample Stat (Opening): ${result.stats.opening.toLocaleString()}`);

    return end - start;
};

// Case 1: Early Game (Tournament 1)
runBenchmark("Early Game (T1)", { tournamentIndex: 0, tierIndex: 5, matchIndex: 1 });

// Case 2: Mid Game (Tournament 10)
runBenchmark("Mid Game (T10)", { tournamentIndex: 9, tierIndex: 5, matchIndex: 1 });

// Case 3: Late Game (Tournament 20 - MAX)
// tournamentIndex 19 is T20.
runBenchmark("End Game (T20 Max)", { tournamentIndex: 19, tierIndex: 9, matchIndex: 2 });
