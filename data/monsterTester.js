const MysticWyvern = require('./monsters/MysticWyvern');
const ShadowFangPredator = require('./monsters/ShadowFangPredator');
const StoneHideGuardian = require('./monsters/StoneHideGuardian');

const AbilityAction = require('./actions/AbilityAction');
const AttackAction = require('./actions/AttackAction');
const DefendAction = require('./actions/DefendAction');

const wyvern = new MysticWyvern();
const shadow = new ShadowFangPredator();
const stone = new StoneHideGuardian();

console.log(`\nWyvern: HP = ${wyvern._currentHealth}, AC = ${wyvern._currentAC}`);
console.log(`Shadow HP = ${shadow._currentHealth}, AC = ${shadow._currentAC}`);

console.log("=== 1: Create defend action for Wyvern ===");
const defend = new DefendAction(wyvern)

console.log("\n=== 2: Create attack action for Shadow ===");
const attack = new AttackAction(shadow, wyvern)

console.log("\n=== 3: Execute actions ===");
defend.execute()
attack.execute()

console.log("\n=== Revert monsters ===");
wyvern.revert()
shadow.revert()

console.log(`\nWyvern: HP = ${wyvern._currentHealth}, AC = ${wyvern._currentAC}`);
console.log(`Shadow HP = ${shadow._currentHealth}, AC = ${shadow._currentAC}`);
