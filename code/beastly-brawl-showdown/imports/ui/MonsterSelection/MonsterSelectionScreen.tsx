import React, { useState, useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { allMonsters } from "/imports/data/monsters/MonsterData";
import { BattleScreen } from "../BattleScreen/BattleScreen";

export const MonsterSelectionScreen = () => {
    const [currentlySelected, setCurrentlySelected] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [confirmEnabled, setConfirmEnabled] = useState(false);

    useEffect(() => {
        console.log("Component rendered. isConfirmed =", isConfirmed);
    }, [isConfirmed]);

    function highlightAndShowConfirm(name: string) {
        console.log("Monster clicked:", name);

        // Remove border from previous
        if (currentlySelected) {
            const deselect = document.getElementById(currentlySelected);
            if (deselect) deselect.style.border = "none";
        }

        // Add border to new
        const selected = document.getElementById(name);
        if (selected) {
            selected.style.border = "solid";
            selected.style.borderWidth = "8px";
        }

        setCurrentlySelected(name);
        setConfirmEnabled(true); // Enable button
    }

    function handleConfirm() {
        console.log("Confirm clicked. Currently selected monster:", currentlySelected);
        setIsConfirmed(true);
    }

    if (isConfirmed) {
        console.log("Rendering BattleScreen");
        return <BattleScreen />;
    }

    return (
        <div className="monsterSelectionScreen">
            <h1>Choose your Monster:</h1>
            {allMonsters.map((monster) => (
                <MonsterContainer
                    key={monster.type}
                    image={monster.imageSelection}
                    name={monster.type}
                    func={highlightAndShowConfirm}
                />
            ))}
            <button
                id="confirmMonsterButton"
                onClick={handleConfirm}
                disabled={!confirmEnabled}
            >
                Confirm
            </button>
        </div>
    );
};
