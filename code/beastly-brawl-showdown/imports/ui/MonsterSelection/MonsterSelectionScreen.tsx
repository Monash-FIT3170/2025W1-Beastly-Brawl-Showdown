import React, { useEffect } from "react";
import { MonsterContainer } from "./MonsterContainer";
import { allMonsters } from "/imports/data/monsters/MonsterData";
import { useNavigate, useParams } from "react-router-dom";
import { Players } from "/imports/api/DataBases";
import { Meteor } from "meteor/meteor";

/**
 * Confirms the monster the player will be using and all function that this button needs
 * @returns HTML button component to confirm monster selection
 */
function ConfirmButton({ onClick }: { onClick: () => void }) {
    return (
        <button id="confirmMonsterButton" onClick={onClick}>
            Confirm
        </button>
    );
}

export const MonsterSelectionScreen = () => {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const playerName = sessionStorage.getItem("guestName");
    if (!playerName) throw new Error("Player name is not set in sessionStorage.");

    // Name of currently selected monster
    const [currentlySelected, setCurrentlySelected] = React.useState<string | null>(null);

    /**
     * Enable confirm button and border the selected monster
     * @param {string} name 
     */
    function highlightAndShowConfirm(name: string) {
        const previouslySelected = currentlySelected;

        if (previouslySelected) {
            const deselect = document.getElementById(previouslySelected);
            if (deselect) {
                deselect.style.border = "none";
            }
        }

        const selected = document.getElementById(name);
        if (selected) {
            selected.style.border = "solid";
            selected.style.borderWidth = "8px";
        }

        setCurrentlySelected(name);

        const confirmButton = document.getElementById("confirmMonsterButton") as HTMLButtonElement;
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.style.cursor = "default";
        }
    }

    function handleConfirm() {
        const player = Players.findOne({ displayName: playerName })
        if (player) {
            const playerId = player.getID();
            player.confirmMonster(id, playerId, currentlySelected)
        }
    }

    useEffect(() => {
        if (!id) return;

        const interval = setInterval(() => {
            Meteor.call("players.checkAllConfirmed", id, (err: any, allConfirmed: boolean) => {
                if (err) {
                    console.error("Error checking confirmation:", err);
                } else if (allConfirmed) {
                    console.log("All players confirmed!");
                    navigate(`/battle/${id}`);
                }
            });
        }, 2000); // every 2 seconds

        return () => clearInterval(interval); // cleanup
    }, [id, navigate]);


    return (
        <div className="monsterSelectionScreen">
            <h1>Choose your Monster:</h1>
            {allMonsters.map(monster => (
                <MonsterContainer
                    key={monster.type}
                    image={monster.imageSelection}
                    name={monster.type}
                    func={highlightAndShowConfirm}
                />
            ))}
            <ConfirmButton onClick={handleConfirm} />
        </div>
    )
}

