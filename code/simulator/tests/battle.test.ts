import { Battle } from "../core/battle";
import { COMMON_MONSTER_POOL } from "../data/common/common_monster_pool";
import { EntryID } from "../core/utils";
import { Notice } from "../core/notice/notice";
import { StartMoveEvent } from "../core/event/core_events";
import { autoResolveRollsAndRerolls, makeBattle, targetEnemy } from "./testUtils";
import { COMMON_MOVE_POOL } from "../data/common/common_move_pool";

describe("Battle Errors", () => {
  test("throws RangeError when monster id is invalid", () => {
    const badOptions = {
      seed: 1,
      monsterPool: COMMON_MONSTER_POOL,
      movePool: COMMON_MOVE_POOL,
      playerOptionSet: [{ monsterId: "missing_monster" as any }],
    } as const;

    expect(() => new Battle(badOptions as any)).toThrow(RangeError);
  });
});

describe("Battle order", () => {
  test("faster monster acts before slower monster when priority is equal", async () => {
    const battle = makeBattle(77, [
      { monsterId: "shadow_fang" },
      { monsterId: "mystic_wryven" },
    ]);
    const autoResolve = autoResolveRollsAndRerolls();
    const autoResolveNotices = {
      onPostNotice: (target: number, notice: Notice) => {
        if (notice.kind === "chooseMove") {
          const enemySide = target === 0 ? 1 : 0;
          notice.callback("attack-normal" as EntryID, targetEnemy(enemySide));
        } else {
          autoResolve.onPostNotice(target, notice);
        }
      },
      onRemoveNotice: autoResolve.onRemoveNotice,
    };
    battle.noticeBoard.subscribeListener(autoResolveNotices);

    try {
      await battle.run();
    } finally {
      battle.noticeBoard.unsubscribeListener(autoResolveNotices);
    }

    const startMoveEvents = battle.eventHistory.events.filter(
      (event): event is StartMoveEvent & { index: number } => {
        return event.name === "startMove";
      }
    );

    expect(startMoveEvents.length).toBeGreaterThanOrEqual(2);
    expect(startMoveEvents[0].source).toBe(battle.sides[0].id);
    expect(startMoveEvents[1].source).toBe(battle.sides[1].id);
  });
});

