import { type BattleEvent } from "../../combat/system/history/events";

type RendererProps = {
  historyString: string;
  //   history: BattleEvent[];
};

function Renderer({ historyString }: RendererProps) {
  try {
    const history: BattleEvent[] = JSON.parse(historyString);
    return (
      <>
        <p>{history.map((event) => JSON.stringify(event))}</p>
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
{"name":"battleOver"},
]








*/
