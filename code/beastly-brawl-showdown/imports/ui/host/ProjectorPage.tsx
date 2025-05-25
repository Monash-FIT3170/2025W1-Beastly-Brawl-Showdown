import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { NotFound } from "../Error/NotFound";

export default function ProjectorPage() {
  const joinCode = sessionStorage.getItem("joinCode");
  if (!joinCode) {
    return <NotFound />;
  }
  // const playerName = sessionStorage.getItem("guestName");
  const [revealUrl, setURL] = useState("");
  let safePlayerName: string;

  // if (playerName == null) {
  //   throw new Error("Player name is not set in sessionStorage.");
  // } else {
  //   safePlayerName = playerName;
  // }

  // useEffect(() => {
  //   if (joinCode) {
  //     console.log("id is set");
  //     const joinURL = Meteor.absoluteUrl(`/join/${joinCode}`);
  //     setURL(joinURL);
  //     console.log("Setting joinURL:", joinURL);
  //   }
  // }, [joinCode]);

  return (
    <div className="waiting-room-box">
      <h1>Room ID: {joinCode}</h1>
      <h2>Waiting Room</h2>
      <WaitingRoomInfoBox joinUrl={revealUrl} />
      <ParticipantDisplayBox name={"PLACEHOLDER NAME"} />
    </div>
  );
}
