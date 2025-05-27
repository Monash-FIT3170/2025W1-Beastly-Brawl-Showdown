import Monsters from "./Monsters";
import MysticWyvern from "./MysticWyvern";
import ShadowFangPredator from "./ShadowFangPredator";
import StoneHideGuardian from "./StoneHideGuardian";

export const mysticWyvern = new MysticWyvern();
export const shadowFang = new ShadowFangPredator();
export const stoneHide = new StoneHideGuardian();

export const allMonsters: Monsters[] = [mysticWyvern, shadowFang, stoneHide];

// export const allMonsterTypes: (typeof Monsters)[] = [
//   MysticWyvern,
//   ShadowFangPredator,
//   StoneHideGuardian,
// ];
