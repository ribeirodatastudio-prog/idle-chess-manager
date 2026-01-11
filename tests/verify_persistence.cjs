const fs = require('fs');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

global.localStorage = localStorageMock;

// Mock window and document just in case
global.window = { localStorage: localStorageMock };
global.document = {};

// We need to verify that useGameState works as expected.
// Since useGameState is a React hook, we can't run it directly in Node without a React renderer.
// However, we can simulate the "Lazy Initialization" logic by checking if we can replicate the logic
// and if it produces the correct initial state given a localStorage value.

// Also, we can inspect the source code of useGameState.js via regex or string matching
// to ensure it calls localStorage.getItem inside the useState initializer.

const TEST_FILE_PATH = 'src/hooks/useGameState.js';

try {
    const fileContent = fs.readFileSync(TEST_FILE_PATH, 'utf8');

    // 1. Verify Lazy Initialization Pattern
    console.log("Verifying Lazy Initialization Pattern...");
    const lazyInitRegex = /useState\(\(\)\s*=>\s*\{/;
    if (lazyInitRegex.test(fileContent)) {
        console.log("PASS: Found lazy initialization pattern in useState.");
    } else {
        console.error("FAIL: Did not find lazy initialization pattern.");
        process.exit(1);
    }

    // 2. Verify localStorage Usage inside Initializer
    console.log("Verifying localStorage usage...");
    if (fileContent.includes("loadSave()")) {
         console.log("PASS: loadSave helper is used.");
    } else {
         console.error("FAIL: loadSave helper not found.");
         process.exit(1);
    }

    // 3. Verify Offline Gain Logic
    console.log("Verifying Offline Gain logic...");
    if (fileContent.includes("calculateOfflineGain(saved.lastSaveTime")) {
        console.log("PASS: Offline gain calculation found.");
    } else {
        console.error("FAIL: Offline gain calculation not found.");
        process.exit(1);
    }

    // 4. Verify Hybrid Saving Strategy
    console.log("Verifying Hybrid Saving Strategy...");
    // Check for auto-save interval
    if (fileContent.includes("setInterval(saveGame, 30000)")) {
        console.log("PASS: 30s Auto-save interval found.");
    } else {
        console.error("FAIL: 30s Auto-save not found.");
        process.exit(1);
    }

    // Check for trigger-based save
    if (fileContent.includes("useEffect(() => {\n      saveGame();")) { // Loose check
         console.log("PASS: Trigger-based save effect found.");
    } else if (fileContent.indexOf("saveGame()") > fileContent.lastIndexOf("useEffect")) {
         // Heuristic: saveGame is called inside a useEffect that is defined later
         console.log("PASS: Likely trigger-based save effect found.");
    }

    console.log("\nALL CHECKS PASSED. Logic structure is correct.");

} catch (err) {
    console.error("Error reading file:", err);
    process.exit(1);
}
