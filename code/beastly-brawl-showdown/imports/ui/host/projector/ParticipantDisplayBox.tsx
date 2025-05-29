import React from "react";
import { ParticipantBox } from "./ParticipantBox";

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
  const names = name
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  return (
    <div className="participants-display-box">
      <div className="participants-header">
        <div className="participants-count">Players: {names.length}</div>
        <button className="glb-btn start-game-btn">Start Game</button>
      </div>

      <div className="participants-grid">
        {names.length > 0 &&
          names.map((n) => (
            <div key={n} className="participants-name-box">
              {n}
            </div>
          ))}
      </div>
    </div>
  );
};
