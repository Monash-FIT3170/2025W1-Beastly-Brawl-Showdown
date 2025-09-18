import * as readline from "readline";
import { Notice, NoticeKind } from "../../core/notice/notice";
import { NoticeBoard } from "../../core/notice/notice_board";
import { SideId } from "../../core/side";
import { EventHistory } from "../../core/event/event_history";
import { EntryID } from "../../core/utils";
import { COMMON_MOVE_NAMES, COMMON_MOVE_POOL } from "../../data/common/common_move_pool";

export class CliAdapter {
  readonly noticeBoard: NoticeBoard;
  readonly eventHistory: EventHistory;

  constructor(noticeBoard: NoticeBoard, eventHistory: EventHistory) {
    this.noticeBoard = noticeBoard;

    this.eventHistory = eventHistory;
  }

  listen(): void {
    const rl: readline.Interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "<<< Enter cmd (target|cmd|arg1|arg2|...):\n> ",
    });

    rl.prompt();

    rl.on("line", (line: string) => {
      switch (line.trim().toLowerCase()) {
        case "history":
          console.log(`History (events count = ${this.eventHistory.events.length}):\n${JSON.stringify(this.eventHistory.events)}`);
          return;
        case "notice":
          console.log(`Notices (player count = ${this.noticeBoard.noticeMaps.length}):\n${JSON.stringify(this.noticeBoard.noticeMaps.map((map) => Object.fromEntries(map)))}`); //* Hacky print
          return;

        default:
          break;
      }

      const [targetStr, eventNameStr, ...args] = line.trim().split("|");

      const target: number = parseInt(targetStr);
      if (isNaN(target) || target >= this.noticeBoard.noticeMaps.length) {
        console.warn("❌ Invalid target index.");
        rl.prompt();
        return;
      }

      const notice: Notice | null = this.noticeBoard.noticeMaps[target].get(eventNameStr as NoticeKind) || null;
      if (!notice) {
        console.warn(`❌ Invalid event name: "${eventNameStr}"`);
        rl.prompt();
        return;
      }

      try {
        switch (notice.kind) {
          case "chooseMove": {
            if (args.length < 1) {
              console.log("❌ onChooseMove requires moveId (and maybe target)");
              break;
            }

            switch (COMMON_MOVE_POOL[args[0].toLowerCase() as COMMON_MOVE_NAMES].targetingMethod) {
              case "self": {
                notice.callback(args[0].toLowerCase() as EntryID, {
                  targetingMethod: "self",
                });
                break;
              }
              case "single-enemy": {
                notice.callback(args[0].toLowerCase() as EntryID, {
                  targetingMethod: "single-enemy",
                  target: parseInt(args[1]) as SideId,
                });
                break;
              }
            }
            break;
          }
          case "roll": {
            notice.callback();
            break;
          }
          case "rerollOption": {
            if (args.length < 1) {
              console.log("❌ rerollOption requires shouldReroll");
              break;
            }

            if (args[0].toLowerCase() === "y") {
              notice.callback(true);
            }
            if (args[0].toLowerCase() === "n") {
              notice.callback(false);
            }

            console.log("❌ rerollOption - shouldReroll should be y/n");
            break;
          }
          default:
            console.error(`❓ Unknown event name: "${eventNameStr}"`);
        }
      } catch (err) {
        console.error(`💥 Error executing callback:`, err);
      }

      rl.prompt();
    });

    rl.on("close", () => {
      console.log("👋 CLI listener terminated.");
    });
  }
}
