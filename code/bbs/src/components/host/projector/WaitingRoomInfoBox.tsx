import { CodeLink } from "./CodeLink";
import { QRBox } from "./QRBox";
import React from "react";

interface WaitingRoomInfoBoxProps {
  joinCode: string;
  joinUrl: string;
}

export const WaitingRoomInfoBox = ({
  joinCode,
  joinUrl,
}: WaitingRoomInfoBoxProps) => {
  return (
    <div className="waiting-room-info-box">
      <div className="game-pin">
        <div className="pin-label">Room Code:</div>
        <div className="join-code">{CodeLink(joinCode)}</div>
      </div>
      <div className="qr-code">
        <QRBox joinUrl={joinUrl} />
      </div>
    </div>
  );
};
