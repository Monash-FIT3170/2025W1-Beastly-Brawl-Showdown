import { asBattleId, Battle } from "../combat/system/battle";
import { MonsterPool } from "../combat/data/monster_pool";
import { Host, Player } from "./user";
import { LobbyId, JoinCode, ServerId } from "../shared/types";
import { PlayerServerToClientEvents } from "../shared/types";
import { Socket } from "socket.io";
import { makeMonster, MonsterTemplate } from "../combat/system/monster";
import { asSideId, Side, SideId } from "../combat/system/side";
import { Action, ActionId, asActionId } from "../combat/system/action";
import { battle_runner } from "../combat/system/battle_runner";


/**
 * Represents a lobby and the data within it.
 */
export class Lobby {
  //# Config
  lobbyId: LobbyId;
  joinCode: JoinCode;

  //# Users
  host: Host;
  players = new Map<string, Player>();
  private playersReadyForBattle = new Set<string>(); // store displayNames of players who have selected


  //# Data
  battles: Battle[] = [];
  private sidesReady = new Set<SideId>();


  constructor(host: Host, lobbyId: LobbyId, joinCode: JoinCode) {
    this.lobbyId = lobbyId;
    this.joinCode = joinCode;

    this.host = host;
    this.setupHost();
  }

  hasPlayer(displayName: string): boolean {
    return this.players.has(displayName);
  }

  refreshPlayerList() {
    const playerNameList = [...this.players.values()!].map((player) => player.displayName);

    //* To host
    this.host.socket.emit("refreshPlayerList", playerNameList);

    //* To players
    this.players.forEach((player) => {
      player.socket.emit("refreshPlayerList", playerNameList);
    });
  }

  private setupHost() {
    this.host.socket.on("requestStartGame", async () => {
      const results = await Promise.allSettled(Array.from(this.players.values()).map((player) => player.socket.emitWithAck("requestMonsterSelection")));

      // Assign results back to players
      Array.from(this.players.values()).forEach((player, index) => {
        const result = results[index];
        if (result.status === "fulfilled") {
          player.monsterTemplate = MonsterPool[result.value]; // Assign the returned ID
        } else {
          console.warn(`Player ${player.displayName} failed to select a monster:`, result.reason);
          // TODO server should assign one if the player fails to do so
        }
      });
    });

    this.host.socket.on("requestStartRound", () => {
      // if the room has flag "ready for next round"
      // host.room.nextRound()
    });
  }

  // May need to move the below methods to a different class
  getSideByPlayer(player: Player): Side | undefined {
    for (const battle of this.battles) {
      for (const side of battle.sides) {
        if (side.controllingPlayer.displayName === player.displayName) {
          return side;
        }
      }
    }
    return undefined;
  }

  getOtherSide(side: Side): Side | undefined {
    for (const battle of this.battles) {
      const otherSides = battle.sides.filter(s => s.id !== side.id);
      if (otherSides.length > 0) {
        return otherSides[0];
      }
    }
    return undefined;
  }

  markPlayerReady(player: Player) {
    const side = this.getSideByPlayer(player);
    if (side) {
      this.sidesReady.add(side.id);
    }
  }

  allSidesReady(): boolean {
    for (const battle of this.battles) {
      for (const side of battle.sides) {
        if (!this.sidesReady.has(side.id)) {
          return false; // If any side is not ready, return false
        }
      }
    }
    return true; // All sides are ready
  }

  resetReadyState() {
    this.sidesReady.clear();
  }

  mapActionToActionId(action: "attack" | "defend" | "ability"): ActionId {
    switch (action) {
      case "attack":
        return asActionId(1);
      case "defend":
        return asActionId(2);
      case "ability":
        return asActionId(3); // Assuming 3 is the ID for ability
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  // End of methods that may need to be moved to a different class

  addAndSetupPlayer(player: Player) {
    this.players.set(player.displayName, player);

    //#Region <<< Monster Selection >>>
    player.socket.on("submitMonsterChoice", () => {
      // validates the monster choice
      if (!player.monsterTemplate) {
        player.socket.emit("error", "No monster template selected.");
        return;
      }

      // Save selected monster template on player
      this.playersReadyForBattle.add(player.displayName);

      //check if all players are ready
      if (this.playersReadyForBattle.size === this.players.size) {
        // If all players are ready, notify everyone
        this.players.forEach((p) => {
          p.socket.emit("allPlayersReady");
        });
      }

      // Create battle
      const sides: Side[] = Array.from(this.players.values()).map((player, index) => ({
        id: asSideId(index),
        controllingPlayer: player,
        monster: makeMonster(player.monsterTemplate!),
        pendingMoveId: null, // No move is pending at the start
      }));

      const battle: Battle = {
        battleId: asBattleId(this.battles.length),
        sides,
      };

      this.battles.push(battle);

      // Run the battle
      battle_runner(battle).catch(console.error);
    });

    player.socket.on("submitGameReadyState", () => {
      // checks if game readyness is locked in
      // if not game the ready state
      throw new Error("Not implemented");
    });
    //#EndRegion <<< Monster Selection >>>

    //#Region <<< Move Submission >>>
    player.socket.on("submitMove", (move: { action: string }) => {
      // checks if move locked
      const side = this.getSideByPlayer(player);
      if (!side) {
        player.socket.emit("error", "You are not in a battle.");
        return;
      }

      const actionId = this.mapActionToActionId(move.action as "attack" | "defend" | "ability");

      // Target the other side
      const otherSide = this.getOtherSide(side);
      if (!otherSide) {
        player.socket.emit("error", "No opponent found.");
        return;
      }

      side.monster.queuedActionData = {
        actionId: actionId,
        targetSideId: otherSide.id,
      };

      this.markPlayerReady(player);

      // Battle Runner
      // If all sides are ready, run the battle logic
      if (this.allSidesReady()) {
        for (const battle of this.battles) {
          battle_runner(battle);
        }
      }
    });


    player.socket.on("submitMoveLockState", () => {
      // checks if not processing turn
      // if not then change move lock state
      throw new Error("Not implemented");
    });
    //#EndRegion <<< Move Submission >>>
  }
}

