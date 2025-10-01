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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinCode).then(() => {
      alert("Copied to clipboard!");
    })
  };

  return (
    <div className="waiting-room-info-box">
      <div className="game-pin">
        <div className="pin-label">Room Code:</div>
        <div className="join-code">{CodeLink(joinCode)}</div>
        <button id="room-code-button" onClick={copyToClipboard}>Click here to copy code</button>
      </div>
      <div className="qr-code">
        <QRBox joinUrl={joinUrl} />
      </div>
    </div>
  );
};
