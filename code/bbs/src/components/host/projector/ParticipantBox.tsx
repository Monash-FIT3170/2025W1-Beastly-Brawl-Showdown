import React from "react";

interface ParticipantBoxProps {
  name: string;
  onKickPlayer?: (playerName: string) => void;
}

export const ParticipantBox: React.FC<ParticipantBoxProps> = ({ name, onKickPlayer }) => {
  return (
    <div className="participants-name-box">
      <div style={{ flex: "1" }}></div>
      <span>{name}</span>
      {onKickPlayer && (
        <button
          className="kick-btn"
          onClick={() => onKickPlayer(name)}
          style={{ marginLeft: "8px", cursor: "pointer", flex: "1"}}
        >
          ❌
        </button>
      )}
    </div>
  );
};
