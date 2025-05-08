import React from "react";
import { MonsterContainer } from "./MonsterContainer";

export const MonsterSelectionScreen = () => {
    // Name of currently selected monster
    let currentlySelected; 

    // On selection, display confirm button and border the selected monster
    function highlightAndShowConfirm(name) {
        if (currentlySelected) {
            // Deselect currently selected item
            let deselect = document.getElementById(currentlySelected).style;
            deselect.border = "none"
        }

        let style = document.getElementById(name).style;
        style.border = "solid"
        style.borderWidth = "8px";
        currentlySelected = name;
    }

    return (
        <div class="monsterSelectionScreen">
            <h1>Choose your Monster:</h1>
            <MonsterContainer image="img/placeholder_monster_1.png" name="monster1" func={highlightAndShowConfirm}/>
            <MonsterContainer image="img/placeholder_monster_2.png" name="monster2" func={highlightAndShowConfirm}/>
            <MonsterContainer image="img/placeholder_monster_3.png" name="monster3" func={highlightAndShowConfirm}/>
        </div>
    )
} 