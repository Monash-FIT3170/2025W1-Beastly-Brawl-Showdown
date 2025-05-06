import React from 'react';
import { BattleTop } from './BattleTop.jsx';
import { BattleMiddle } from './BattleMiddle.jsx';
import { BattleBottom } from './BattleBottom.jsx';

export const BattleScreen = () => (
  <div className = "battleScreen">
    <BattleTop/>
    <BattleMiddle/>
    <BattleBottom/>
  </div>
);
