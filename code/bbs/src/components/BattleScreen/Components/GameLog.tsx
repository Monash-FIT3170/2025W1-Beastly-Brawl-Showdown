import React, { useEffect, useMemo, useRef } from "react";
import { parseTurns } from "./turns_array_maker";
import { BaseEvent } from "../../../../../simulator/core/event/base_event";

interface GameLogProps {
  isOpen: boolean;
  onClose: () => void;
  events: BaseEvent[];
}

const GameLog: React.FC<GameLogProps> = ({ isOpen, onClose, events }) => {
  // Build turns from raw events
  const turns = useMemo(() => parseTurns(events), [events]);

  // Build the game log
  const logEntries = useMemo(() => {
    const entries: { key: string; text: string }[] = [];
    if (!turns.length) return entries;

    const lastTurnIndex = Math.max(0, turns.length - 1);
    for (let turnNumber = 0; turnNumber <= lastTurnIndex; turnNumber++) {
      const t = turns[turnNumber];

      entries.push({
        key: `turn-${turnNumber}-start`,
        text: `Turn ${turnNumber + 1} started`,
      });

      for (let eventIndex = 0; eventIndex < t.turnEvents.length; eventIndex++) {
        const ev = t.turnEvents[eventIndex];
        entries.push({
          key: `turn-${turnNumber}-event-${eventIndex}`,
          text: t.printEventString(ev).toString() ?? "Unknown event",
        });
      }
    }
    return entries;
  }, [turns]);

  // Automatically go to the bottom when the game log is opened
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen || !bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [isOpen, logEntries]);

  if (!isOpen) return null;

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 998,
        }}
      />

      {/* bottom sheet */}
      <div
        role="dialog"
        aria-label="Game Log"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: "40vh",
          background: "#fff",
          borderTop: "2px solid #222",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          zIndex: 999,
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 12px",
            borderBottom: "1px solid #eee",
          }}
        >
          <strong style={{ fontSize: 16 }}>Game Log</strong>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={onClose}>Close</button>
          </div>
        </div>

        {/* body */}
        <div
          ref={bodyRef}
          style={{ flex: 1, overflowY: "auto", padding: 12, background: "#fafafa" }}
        >
          {logEntries.length === 0 ? (
            <p style={{ margin: 0, color: "#666" }}>No log entries yet.</p>
          ) : (
            logEntries.map(({ key, text }) => (
              <p key={key} style={{ margin: "4px 0 6px" }}>
                {text}
              </p>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default GameLog;
