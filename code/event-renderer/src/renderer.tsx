import { type BattleEvent, type DamageEvent } from "../../combat/system/history/events";

type RendererProps = {
  historyString: string;
};

function Renderer({ historyString }: RendererProps) {
  try {
    const history: BattleEvent[] = JSON.parse(historyString);
    return (
      <>
        <div>
          {history.map((event, i) => {
            switch (event.name) {
              case "battleOver":
                return (
                  <p>
                    {i}: {"End of battle"}
                  </p>
                );
              case "damage":
                const e: DamageEvent = event;
                return (
                  <p>
                    {i}: [Monster from side {e.source}] [dealt {e.amount}] to [monster from side {e.target}]
                  </p>
                );
              default:
                return <p>{i}: UNKNOWN EVENT ERROR</p>;
            }
          })}
        </div>
      </>
    );
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
