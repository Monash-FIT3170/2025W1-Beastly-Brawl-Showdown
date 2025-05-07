import React from "react";
import { MonsterContainer } from "./MonsterContainer";

export const MonsterSelectionScreen = () => {
    return (
        <div class="monsterSelectionScreen">
            <h1>TEST SCRIPT</h1>
            <MonsterContainer image="img/placeholder_monster_1.png" name="monster1"/>
            <MonsterContainer image="img/placeholder_monster_2.png" name="monster2"/>
            <MonsterContainer image="img/placeholder_monster_3.png" name="monster3"/>
        </div>
    )
}