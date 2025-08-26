import React, { useState, useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { useNavigate } from "react-router-dom";
import { MonsterPool } from "/imports/simulator/data/monster_pool";

interface MonsterSelectionScreenProps {
  setSelectedMonsterCallback?: (value: string) => void;
}

export const MonsterSelectionScreen: React.FC<MonsterSelectionScreenProps> = ({
  setSelectedMonsterCallback,
}) => {
  const navigate = useNavigate();

  const [selectedMonster, setSelectedMonster] = useState<string>("");
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  function highlightAndShowConfirm(name: string) {
    console.log("Monster clicked:", name);

    // Remove styling from previous selection
    if (selectedMonster) {
      const deselect = document.getElementById(selectedMonster);
      if (deselect) {
        deselect.style.border = "none";
        deselect.style.opacity = "1";
      }
    }

    // Add styling to new selection
    const selected = document.getElementById(name);
    if (selected) {
      selected.style.border = "solid";
      selected.style.borderWidth = "8px";
      selected.style.opacity = "0.5";
    }

    setSelectedMonster(name);
    setConfirmEnabled(true);
  }

  function handleConfirm() {
    if (selectedMonster) {
      console.log("Confirmed monster:", selectedMonster);
      setIsConfirmed(true);
      navigate("/play");
    }
  }

  useEffect(() => {
    if (isConfirmed && selectedMonster && setSelectedMonsterCallback) {
      setSelectedMonsterCallback(selectedMonster);
    }
  }, [isConfirmed, selectedMonster, setSelectedMonsterCallback]);

  return (
    <div className="canvas-body" id="monster-selection-screen">
      <h1 className="monster-selection-screen-title">Choose Your</h1>
      <h1 className="monster-selection-screen-title" id="header-2">
        Monster!
      </h1>
      <div className="monster-selection-grid">
        {MonsterPool.filter((m) => m.name !== "BlankMon").map((monster) => (
          <MonsterContainer
            key={monster.name}
            name={monster.name}          
            type={monster.description}      
            currentlySelectedMonster={highlightAndShowConfirm}
          />
        ))}

        <button
          className="glb-btn"
          id="monster-selection-btn"
          onClick={handleConfirm}
          disabled={!confirmEnabled}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};
