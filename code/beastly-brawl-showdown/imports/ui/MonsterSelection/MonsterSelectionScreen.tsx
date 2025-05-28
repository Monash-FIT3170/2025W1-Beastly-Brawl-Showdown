import React, { useState, useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { monsterData, MonsterName } from "../../data/monsters/MonsterData";
import { BattleScreen } from "../BattleScreen/BattleScreen";

interface MonsterSelectionScreenProps {
  selectedMonster?: string;
  setSelectedMonsterCallback: (value: string) => void;
}

export const MonsterSelectionScreen: React.FC<MonsterSelectionScreenProps> = ({
  selectedMonster,
  setSelectedMonsterCallback,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmEnabled, setConfirmEnabled] = useState(false);

  useEffect(() => {
    console.log("Component rendered. isConfirmed =", isConfirmed);
  }, [isConfirmed]);

  function highlightAndShowConfirm(name: string) {
    console.log("Monster clicked:", name);

    // Remove border from previous
    if (selectedMonster) {
      const deselect = document.getElementById(selectedMonster);
      if (deselect) deselect.style.border = "none";
    }

    // Add border to new
    const selected = document.getElementById(name);
    if (selected) {
      selected.style.border = "solid";
      selected.style.borderWidth = "8px";
    }

    setSelectedMonsterCallback(name);
    setConfirmEnabled(true);
  }

  function handleConfirm() {
    console.log("Confirm clicked. Selected monster:", selectedMonster);
    setIsConfirmed(true);
  }

  if (isConfirmed && selectedMonster) {
    <BattleScreen selectedMonsterName={selectedMonster as MonsterName} />
  }

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
            func={highlightAndShowConfirm}
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
