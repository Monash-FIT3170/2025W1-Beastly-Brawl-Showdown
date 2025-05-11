import React from "react";
import { MonsterContainer } from "./MonsterContainer";

/**
 * Confirms the monster the player will be using and all function that this button needs
 * @returns HTML button component to confirm monster selection
 */
function ConfirmButton() {
    return (
        <button id="confirmMonsterButton" disabled>
            Confirm
        </button>
    )
}

export const MonsterSelectionScreen = () => {
    // Name of currently selected monster
    let currentlySelected; 

    /**
     * Enable confirm button and border the selected monster
     * @param {string} name 
     */
    function highlightAndShowConfirm(name) {
        if (currentlySelected) {
            // Deselect currently selected item
            let deselect = document.getElementById(currentlySelected).style;
            deselect.border = "none"
        }

        // Create border around selected mosnter
        let style = document.getElementById(name).style;
        style.border = "solid"
        style.borderWidth = "8px";
        currentlySelected = name;

        // Enable confirm button once an option has been selected
        let confirmButton = document.getElementById("confirmMonsterButton");
        confirmButton.disabled = false;
        confirmButton.style.cursor = "default";
    }

    return (
        <div class="monsterSelectionScreen">
            <h1>Choose your Monster:</h1>
            <MonsterContainer image="img/placeholder_monster_1.png" name="monster1" func={highlightAndShowConfirm}/>
            <MonsterContainer image="img/placeholder_monster_2.png" name="monster2" func={highlightAndShowConfirm}/>
            <MonsterContainer image="img/placeholder_monster_3.png" name="monster3" func={highlightAndShowConfirm}/>
            <ConfirmButton/>
        </div>
    )
}

