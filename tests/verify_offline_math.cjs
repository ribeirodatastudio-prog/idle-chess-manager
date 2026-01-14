const { calculateOfflineGain } = require('../src/logic/math.js');

console.log("=== Verifying Offline Math ===");

const rate = 1.0; // 1 per sec
const now = Date.now();

// Test A: Too Short (< 120s)
const tShort = now - (60 * 1000); // 60s ago
const resShort = calculateOfflineGain(tShort, rate);
if (resShort === null) console.log("PASS: < 120s ignored");
else console.error("FAIL: Short time triggered gain");

// Test B: Valid Time (1 hour)
const tValid = now - (3600 * 1000);
const resValid = calculateOfflineGain(tValid, rate);
if (resValid && Math.abs(resValid.gain - 3600) < 5) console.log("PASS: 1h calc correct");
else console.error(`FAIL: 1h calc wrong. Gain: ${resValid?.gain}`);

// Test C: Cap (25 hours) -> Should cap at 24h (86400s)
const tLong = now - (25 * 3600 * 1000);
const resLong = calculateOfflineGain(tLong, rate);
if (resLong && Math.abs(resLong.seconds - 86400) < 5) console.log("PASS: 25h capped at 24h");
else console.error(`FAIL: Cap logic wrong. Seconds: ${resLong?.seconds}`);

console.log("=== Verification Complete ===");
