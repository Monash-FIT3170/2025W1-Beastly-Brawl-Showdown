import React, { useState, useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { useNavigate } from "react-router";
import { COMMON_MONSTER_POOL } from "../../../../simulator/data/common/common_monster_pool";

interface MonsterSelectionScreenProps {
  setSelectedMonsterCallback?: (value: string) => void;
  monsterPool?: string[]; // Optional pool for Random mode
}

export const MonsterSelectionScreen: React.FC<MonsterSelectionScreenProps> = ({
  setSelectedMonsterCallback,
  monsterPool,
}) => {
  const navigate = useNavigate();

  const [selectedMonster, setSelectedMonster] = useState<string>("");
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Pool of monsters to display in the grid
  const [displayPool, setDisplayPool] = useState<string[]>([]);

  //#region Highlight and select monster
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
  //#endregion

  //#region Confirm selection
  function handleConfirm() {
    if (selectedMonster) {
      console.log("Confirmed monster:", selectedMonster);
      setIsConfirmed(true);
      navigate("/play");
    }
  }
  //#endregion

  //#region Update parent with selection
  useEffect(() => {
    if (isConfirmed && selectedMonster && setSelectedMonsterCallback) {
      setSelectedMonsterCallback(selectedMonster);
    }
  }, [isConfirmed, selectedMonster, setSelectedMonsterCallback]);
  //#endregion

  //#region Determine monsters to display (Standard vs Random)
  useEffect(() => {
    if (monsterPool && monsterPool.length > 0) {
      // Random mode: use the provided pool (3 monsters)
      setDisplayPool(monsterPool);
    } else {
      // Standard mode: display all monsters except BlankMon
      const allKeys = Object.keys(COMMON_MONSTER_POOL.monsters)
        .filter(
          (key) =>
            COMMON_MONSTER_POOL.monsters[
              key as keyof typeof COMMON_MONSTER_POOL.monsters
            ].name !== "BlankMon"
        );
      setDisplayPool(allKeys);
    }
  }, [monsterPool]);
  //#endregion

  //#region Render
  return (
    <div className="canvas-body" id="monster-selection-screen">
      <h1 className="monster-selection-screen-title">Choose Your</h1>
      <h1 className="monster-selection-screen-title" id="header-2">
        Monster!
      </h1>
      <div className="monster-selection-grid">
        {displayPool.map((monsterKey) => {
          const monster =
            COMMON_MONSTER_POOL.monsters[
              monsterKey as keyof typeof COMMON_MONSTER_POOL.monsters
            ];
          if (!monster) return null;

          return (
            <MonsterContainer
              key={monster.templateId}
              name={monster.name}
              desc={monster.description}
              currentlySelectedMonster={highlightAndShowConfirm}
            />
          );
        })}
      </div>

      <button
        className="glb-btn"
        id="monster-selection-btn"
        onClick={handleConfirm}
        disabled={!confirmEnabled}
      >
        Confirm
      </button>
    </div>
  );
  //#endregion
};