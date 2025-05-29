import React, { useState, useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { monsterData } from "../../data/monsters/MonsterData";

interface MonsterSelectionScreenProps {
  setSelectedMonsterCallback: (value: string) => void;
}

export const MonsterSelectionScreen: React.FC<MonsterSelectionScreenProps> = ({
  setSelectedMonsterCallback,
}) => {


  const [isConfirmed, setIsConfirmed] = useState(false);
  // Enable confirm button
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  // Currently selected monster
  const [selectedMonster, setMonsterName] = useState("");

  useEffect(() => {
    console.log("Component rendered. isConfirmed =", isConfirmed);
  }, [isConfirmed]);

  /**
   * Updates the currently selected monster visually and in code 
   * @param name name of monster currently selected
   */
  function currentlySelectedMonster(name: string) {
    console.log("Monster clicked:", name);

    // Assign monster name value
    setMonsterName(name);

    // Remove border from previous
    if (selectedMonster) {
      const deselect = document.getElementById(selectedMonster);
      if (deselect) {
        deselect.style.border = "none";
        deselect.style.opacity = "1";
      }
    }

    // Add border to new
    const selected = document.getElementById(name);
    if (selected) {
      selected.style.border = "solid";
      selected.style.borderWidth = "8px";
      selected.style.opacity = "0.5";
    }

    // Enabled button once monster has been clicked
    setConfirmEnabled(true);
  }

  /**
   * Handles passing of information back to PlayerPage.tsx
   */
  function handleConfirm() {
    console.log("Confirm clicked. Selected monster:", selectedMonster);
    setIsConfirmed(true);
  }

  // If confirm button pressed and monster selected, return result to parent page (PlayerPage.tsx)
  useEffect(() => {
    if (isConfirmed && selectedMonster) {
      setSelectedMonsterCallback(selectedMonster);
    }
  }, [isConfirmed, selectedMonster, setSelectedMonsterCallback]);

  // HTML display of the monsters
  return (
    <div className="monsterSelectionScreen">
      <h1>Choose your Monster:</h1>
      {Object.entries(monsterData).map(([name, MonsterData]) => {
        const previewMonster = new MonsterData();
        return (
          <MonsterContainer
            key={name}
            image={previewMonster.imageSelection}
            name={name}
            currentlySelectedMonster={currentlySelectedMonster}
          />
        );
      })}
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
