import MysticWyvern from './MysticWyvern';
import ShadowFangPredator from './ShadowFangPredator';
import StoneHideGuardian from './StoneHideGuardian';

export const monsterData = {
  MysticWyvern,
  ShadowFangPredator,
  StoneHideGuardian,
};

export type MonsterName = keyof typeof monsterData;
