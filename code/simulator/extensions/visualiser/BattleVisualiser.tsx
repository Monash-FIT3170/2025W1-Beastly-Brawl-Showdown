import React, { useState } from "react";
import EventTextBox from "./Components/event_textbox";
import BattleScene from "./Components/battle_scene";
import BattleBar from "./Components/battle_bar";
import type { BaseEvent } from "@core/event/base_event";
import { parseTurns } from "./Components/turns_array_maker";

const BattleVisualizerDemo: React.FC = () => {
  const [events, setEvents] = useState<BaseEvent[]>([]);
  const [turnInput, setTurnInput] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      <EventTextBox onEventsSubmit={setEvents} />
      <BattleScene events={events} turnIndex={turnInput} autoplay={false} onAdvanceTurn={(next) => setTurnIndex(next)}/>
      <BattleBar
        turnInput={turnInput}
        setTurnInput={setTurnInput}
        maxTurns={parseTurns(events).length}
      />
    </div>
  );
};

export default BattleVisualizerDemo;
