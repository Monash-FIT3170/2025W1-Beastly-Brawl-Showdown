import { type BattleEvent, type DamageEvent } from "../../combat/system/history/events";

type RendererProps = {
  historyString: string;
  currentEventIndex: number;
};

function Renderer({ historyString, currentEventIndex }: RendererProps) {
  try {
    const history: BattleEvent[] = JSON.parse(historyString);
    const event = history[currentEventIndex];
    {
      switch (event.name) {
        case "battleOver":
          return (
            <p>
              {currentEventIndex}: {"End of battle"}
            </p>
          );
        case "damage":
          const e: DamageEvent = event as DamageEvent;
          return (
            <p>
              {currentEventIndex}: [Monster from side {e.source}] [dealt {e.amount}] to [monster from side {e.target}]
            </p>
          );
        default:
          return <p>{currentEventIndex}: UNKNOWN EVENT ERROR</p>;
      }
    }
  } catch {
    return (
      <>
        <p>Invalid history...</p>
      </>
    );
  }
}

export default Renderer;

/*





[
{"name":"damage", "source":1, "target":0, "amount":1},
{"name":"damage", "source":0, "target":1, "amount":4},
{"name":"damage", "source":1, "target":0, "amount":5},
{"name":"damage", "source":1, "target":0, "amount":12},
{"name":"battleOver"}
]





*/
