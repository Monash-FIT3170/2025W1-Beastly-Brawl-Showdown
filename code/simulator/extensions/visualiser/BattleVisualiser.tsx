import React, { useState } from "react";
import EventTextBox from "./Components/event_textbox";
import BattleScene from "./Components/battle_scene";
import BattleBar from "./Components/battle_bar";
import type { BaseEvent } from "../../core/event/base_event";
import { parseTurns } from "./Components/turns_array_maker";
import GameLog from "./Components/GameLog";

const BattleVisualizerDemo: React.FC = () => {
  const [events, setEvents] = useState<BaseEvent[]>([]);
  const [turnInput, setTurnInput] = useState(0);

  const [isAutoplay, setIsAutoplay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isLogOpen, setIsLogOpen] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <EventTextBox onEventsSubmit={setEvents} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 16px" }}>
        <button onClick={() => setIsPlaying(p => !p)}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={isAutoplay}
            onChange={(e) => setIsAutoplay(e.target.checked)}
          />
          Autoplay
        </label>

        <div style={{ marginLeft: "auto" }}>
          <button onClick={() => setIsLogOpen(true)}>Open Log</button>
        </div>
      </div>

      <BattleScene
        events={events}
        turnIndex={turnInput}
        isPlaying={isPlaying}
        autoAdvance={isAutoplay}
        onAdvanceTurn={(next) => setTurnInput(next)}
      />

      <BattleBar
        turnInput={turnInput}
        setTurnInput={setTurnInput}
        maxTurns={parseTurns(events).length}
      />

      <GameLog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        events={events}
      />
    </div>
  );
};

export default BattleVisualizerDemo;
