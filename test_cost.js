import { calculateUpgradeCost } from './src/logic/math.js';

console.log("Checking current behavior for 'opening' (Standard 100 level spike):");
// Level 98 -> buying 99
// Level 99 -> buying 100 (Should spike if logic is "currentLevel + 1")
// Level 100 -> buying 101

const cost98 = calculateUpgradeCost(98, false, 'opening'); // Buying level 99
const cost99 = calculateUpgradeCost(99, false, 'opening'); // Buying level 100
const cost100 = calculateUpgradeCost(100, false, 'opening'); // Buying level 101

console.log(`Level 99 (Cost to buy): ${cost98}`);
console.log(`Level 100 (Cost to buy): ${cost99}`);
console.log(`Level 101 (Cost to buy): ${cost100}`);

const ratio1 = cost99 / cost98;
const ratio2 = cost100 / cost99;

console.log(`Ratio 99->100: ${ratio1.toFixed(2)} (Expected ~1.1 or ~5.5)`);
console.log(`Ratio 100->101: ${ratio2.toFixed(2)} (Expected ~1.1 or ~0.2 if spike is temp)`);
