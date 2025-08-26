import { DefaultEventsMap, Server, Socket } from "socket.io";
import { MonsterId, MonsterPool } from "@sim/core/monster/monster_pool";
import { Battle, PlayerOptions } from "@sim/core/battle";
import express from "express";
import { createServer } from "node:http";
import * as readline from "readline";
import { ChooseMove, Notice, Roll } from "@sim/core/notice/notice";
import { OrderedEvent } from "@sim/core/event/event_history";
import { SideId } from "@sim/core/side";
import { PlayerToServerEvents, ServerToPlayerEvents } from "./api";
import { COMMON_MONSTER_POOL } from "@sim/data/common/common_monster_pool";
import { commonMovePool } from "@sim/data/common/common_move_pool";

type Player = {
  name: string;
  sideId: SideId;
  monsterId: MonsterId;
  socket: Socket<PlayerToServerEvents, ServerToPlayerEvents, never, PlayerSocketData>;
};

interface PlayerSocketData {
  // name: string;
  // monsterTemplateId: number;
}

const MIN_PLAYER_COUNT = 2;

const players: Player[] = [];

/// Setup CLI
const rl: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

/// Setup server
const app = express();
const server = createServer(app);
const io = new Server<PlayerToServerEvents, ServerToPlayerEvents, never, PlayerSocketData>(server, {
  cors: {
    origin: "http://localhost:5173/",
  },
});

/// Middleware
io.use((socket, next) => {
  const auth = socket.handshake.auth;

  if (!auth) {
    next(new Error("Authentication error"));
    return;
  }
  if (!auth.name) {
    next(new Error("Authentication error: no name provided"));
    return;
  }

  /// Valid connection
  const newPlayer: Player = {
    name: auth.name, //`P${players.length + 1}`,
    sideId: players.length as SideId,
    socket: socket,
    monsterId: "mystic_wryven",
  };

  players.push(newPlayer);
  console.log(`New player:\n\t- Name: ${newPlayer.name}\n\t- Monster Template: ${JSON.stringify(newPlayer.monsterId)}`);
  next();
});

/// Start accepting requests to connect
io.on("connection", (socket) => {
  socket.on("disconnect", (dc_reason) => {
    console.log(`Socket disconnected: ${dc_reason}`);
  });

  socket.onAny((args) => {
    console.log(`Recieved event: ${args}`);
  });
});

console.log("Start server at http://localhost:3000");
server.listen(3000, () => {
  console.log("Waiting for connections...");

  rl.prompt();
  /// Wait for host to confirm start
  /// - Make sure there is at least 2 players
  const listenForStart = (line: string) => {
    switch (line.trim().toLowerCase()) {
      case "start":
        console.log(`Attempting start:\n\tUsers: ${players.length}/${MIN_PLAYER_COUNT}`);
        if (players.length < MIN_PLAYER_COUNT) {
          console.log("Not enough players.");
          break;
        }
        console.log("Starting...");
        rl.removeListener("line", listenForStart);
        startSimulator();
        return;
      default:
        console.log('Awaiting "start" command...');
        break;
    }
    rl.prompt();
  };

  rl.on("line", listenForStart);
});

function startSimulator() {
  /// Create battle
  const battle: Battle = new Battle({
    seed: 0,
    monsterPool: COMMON_MONSTER_POOL,
    movePool: commonMovePool,
    playerOptionSet: players.map((player) => {
      const playerOptions: PlayerOptions = {
        monsterId: player.monsterId,
      };
      return playerOptions;
    }),
  });

  /// Subscribe to notice events
  battle.noticeBoard.subscribeListener({
    onPostNotice: function (target: number, notice: Notice): void {
      console.log(`[target=${target}] Start listen for: ${notice.kind}`);
      players[target].socket.emit("newNotice", notice);
    },
    onRemoveNotice: function (target: number, notice: Notice): void {
      console.log(`[target=${target}] Stop listen for: ${notice.kind}`);
    },
  });
  players.map((player, index) => {
    player.socket.on("getSelfInfo", () => {
      return player.sideId;
    });

    player.socket.on("getHistory", () => {
      return battle.eventHistory.events;
    });
    player.socket.on("getNotices", () => {
      return Array.from(battle.noticeBoard.noticeMaps[player.sideId].values());
    });

    player.socket.on("resolveNotice", (noticeKind, params) => {
      switch (noticeKind) {
        // TODO make generic
        case "chooseMove": {
          const chooseMove = battle.noticeBoard.noticeMaps[index].get(noticeKind)! as ChooseMove;
          const chooseMoveParams = params as Parameters<ChooseMove["callback"]>;
          chooseMove.callback(...chooseMoveParams);
          break;
        }

        case "roll": {
          const roll = battle.noticeBoard.noticeMaps[index].get(noticeKind)! as Roll;
          const rollParams = params as Parameters<Roll["callback"]>;
          roll.callback(...rollParams);
          break;
        }

        // TODO Reroll
        default:
          console.error(`Notice resolution [noticeKind=${noticeKind}] not implmeneted.`);
          break;
      }
    });
  });

  /// Subscribe to event history
  battle.eventHistory.subscribeListener({
    onNewEvent: function (event: OrderedEvent): void {
      console.log(JSON.stringify(event));

      // TODO - better way to broadcast to all
      players.map((player) => {
        player.socket.emit("newEvent", event);
      });
    },
  });

  //# Start battle
  console.log(`Battle: Run`);
  battle.run();
}
