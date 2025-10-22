import { useState, useRef, useCallback } from "react";
import type { BaseEvent } from "../../../../../simulator/core/event/base_event";
import { parseSnapshot } from "../Components/snapshot_parser";
import type {
    BlockedEvent,
    BuffEvent,
    DamageEvent,
    MoveEvadedEvent,
    MoveFailedEvent,
    MoveSuccessEvent,
    RerollEvent,
    RollEvent
} from "../../../../../simulator/core/event/core_events";

interface UseBattleEventsParams {
    myId: number;
    parentDiceRollResult: number | null;
    enqueueAnim: (moveId: string, actor: "player1" | "player2") => void;
    showDiceRoll: (roll: number) => Promise<void>;
}

export function useBattleEvents({
    myId,
    parentDiceRollResult,
    enqueueAnim,
    showDiceRoll
}: UseBattleEventsParams) {
    const [currentMessage, setCurrentMessage] = useState("");
    const previousEventRef = useRef<BaseEvent | null>(null);

    const applyEventToVisible = useCallback(
        async (state: any[], ev: BaseEvent) => {
            switch (ev.name) {
                case "moveSuccess": {
                    const e = ev as MoveSuccessEvent;
                    const isPlayer = e.source === myId;
                    const moveName = e.moveName;
                    const message = isPlayer
                        ? `You ${moveName} successfully!`
                        : `Enemy ${moveName}s successfully!`;
                    setCurrentMessage(message);
                    enqueueAnim(e.moveId, isPlayer ? "player1" : "player2");
                    break;
                }
                case "moveFailed": {
                    const e = ev as MoveFailedEvent;
                    const isPlayer = e.source === myId;
                    const moveName = e.moveId;
                    let message = isPlayer
                        ? `Your ${moveName} failed!`
                        : `Enemy ${moveName} failed!`;
                    setCurrentMessage(message);
                    break;
                }
                case "blocked": {
                    const e = ev as BlockedEvent;
                    const isPlayerAttacking = e.source === myId;
                    const message = isPlayerAttacking
                        ? "Your attack was blocked!"
                        : "You blocked the enemy's attack!";
                    setCurrentMessage(message);
                    break;
                }
                case "evaded": {
                    const e = ev as MoveEvadedEvent;
                    const isPlayerAttacking = e.source === myId;
                    const message = isPlayerAttacking
                        ? "Your attack was evaded!"
                        : "You evaded the enemy's attack!";
                    setCurrentMessage(message);
                    break;
                }
                case "damage": {
                    const e = ev as DamageEvent;
                    const isPlayerTakingDamage = e.target === myId;
                    const message = isPlayerTakingDamage
                        ? `You took ${e.amount} damage!`
                        : `Enemy took ${e.amount} damage!`;
                    setCurrentMessage(message);
                    state[e.target].health -= e.amount;
                    break;
                }
                case "buff": {
                    const e = ev as BuffEvent;
                    const isPlayer = e.source === myId;
                    if (e.buffs.armour && e.source === e.target) {
                        const message = isPlayer
                            ? `You gained +${e.buffs.armour} armor!`
                            : `Enemy gained +${e.buffs.armour} armor!`;
                        setCurrentMessage(message);
                        const actor = isPlayer ? "player1" : "player2";
                        enqueueAnim("defend", actor);
                    }
                    state[e.source].defendActionCharge -= 1;
                    break;
                }
                case "reroll": {
                    const e = ev as RerollEvent;
                    if (e.source === myId) {
                        await showDiceRoll(e.result);
                        setCurrentMessage(`You would have rolled ${parentDiceRollResult} to hit but instead you rerolled and got ${e.result}`);
                    }
                    break;
                }
                case "roll": {
                    const e = ev as RollEvent;
                    if (e.source === myId) {
                        await showDiceRoll(e.result);
                        let message: string;
                        switch (previousEventRef.current?.name) {
                            case "startMove":
                                message = `You rolled ${e.result} to hit`;
                                break;
                            case "moveSuccess":
                                message = `You rolled ${e.result} to damage`;
                                break;
                            default:
                                message = `You rolled ${e.result}`;
                        }
                        setCurrentMessage(message);
                    }
                    break;
                }
                case "battleOver": {
                    setCurrentMessage("Battle Over!");
                    break;
                }
            }
            previousEventRef.current = ev;
            return state;
        },
        [myId, parentDiceRollResult, enqueueAnim, showDiceRoll]
    );

    const cloneState = (state: ReturnType<typeof parseSnapshot>) => {
        return typeof structuredClone === "function"
            ? structuredClone(state)
            : JSON.parse(JSON.stringify(state));
    };

    return {
        applyEventToVisible,
        currentMessage,
        setCurrentMessage,
        cloneState,
    };
}
