import React from "react";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";

export default function WaitingRoom() {
  return (
    <div className="waiting-room-box">
      <WaitingRoomInfoBox />
      <ParticipantDisplayBox />
    </div>
  );
}
