import MysticWyvern from './monsters/MysticWyvern';
import ShadowFangPredator from './monsters/ShadowFangPredator';
import StoneHideGuardian from './monsters/StoneHideGuardian';

import AbilityAction from './actions/AbilityAction';
import AttackAction from './actions/AttackAction';
import DefendAction from './actions/DefendAction';

const wyvern = new MysticWyvern();
const shadow = new ShadowFangPredator();
const stone = new StoneHideGuardian();

//chnaged the logging lines, not sure if it broke
console.log(`\nWyvern: HP = ${wyvern.health}, AC = ${wyvern.AC}`);
console.log(`Shadow HP = ${shadow.health}, AC = ${shadow.AC}`);


console.log("=== 1: Create defend action for Wyvern ===");
const defend = new DefendAction(wyvern);

console.log("\n=== 2: Create attack action for Shadow ===");
const attack = new AttackAction(shadow, wyvern);

console.log("\n=== 3: Execute actions ===");
defend.execute();
attack.execute();

console.log("\n=== Revert monsters ===");
wyvern.revert();
shadow.revert();

console.log(`\nWyvern: HP = ${wyvern.health}, AC = ${wyvern.AC}`);
console.log(`Shadow HP = ${shadow.health}, AC = ${shadow.AC}`);

