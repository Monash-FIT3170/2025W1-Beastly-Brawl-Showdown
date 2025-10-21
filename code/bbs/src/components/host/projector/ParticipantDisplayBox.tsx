import React from "react";
import { ParticipantBox } from "./ParticipantBox";

interface ParticipantDisplayBoxProps {
  name: string; // comma-separated player names
  onKickPlayer?: (playerName: string) => void;
}

export const ParticipantDisplayBox: React.FC<ParticipantDisplayBoxProps> = ({
  name,
  onKickPlayer,
}) => {
  const names = name
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  return (
    <div className="participants-display-box">
      <div className="participants-grid">
        {names.map((n) => (
          <ParticipantBox key={n} name={n} onKickPlayer={onKickPlayer} />
        ))}
      </div>
    </div>
  );
};
