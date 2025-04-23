const MysticWyvern = require('./monsters/MysticWyvern');
const ShadowFangPredator = require('./monsters/ShadowFangPredator');
const StoneHideGuardian = require('./monsters/StoneHideGuardian');

const Action = require('./actions/Actions');

const wyvern = new MysticWyvern();
const shadow = new ShadowFangPredator();
const stone = new StoneHideGuardian();

console.log("=== Turn 1: Wyvern defends ===");
Action.defend(wyvern);

console.log("\n=== Turn 2: ShadowFangPredator attacks Wyvern ===");
Action.attack(shadow, wyvern);

console.log("\n=== End of Turn: Wyvern's defense fades ===");
Action.endDefend(stone);

console.log(`\nResult: ${wyvern.type} HP = ${wyvern.health}, AC = ${wyvern.AC}`);
