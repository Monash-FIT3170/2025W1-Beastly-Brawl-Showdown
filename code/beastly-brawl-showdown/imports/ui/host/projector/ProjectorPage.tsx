import { Meteor } from "meteor/meteor";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";

export default function ProjectorPage() {
  const { id } = useParams();
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState("");
  let safePlayerName: string;

  if (playerName == null) {
    throw new Error("Player name is not set in sessionStorage.");
  } else {
    safePlayerName = playerName;
  }

  useEffect(() => {
    if (id) {
      console.log("id is set");
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
      console.log("Setting joinURL:", joinURL);
    }
  }, [id]);

  return (
    <div className="waiting-room-box">
      <h1>Room ID: {id}</h1>
      <h2>Waiting Room</h2>
      <WaitingRoomInfoBox joinUrl={revealURL} />
      <ParticipantDisplayBox name={safePlayerName} />
    </div>
  );
}
