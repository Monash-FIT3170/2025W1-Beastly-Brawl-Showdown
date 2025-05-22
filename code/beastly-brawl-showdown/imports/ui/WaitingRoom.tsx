import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function WaitingRoom() {
  const { id } = useParams();
  const playerName = sessionStorage.getItem("guestName")
  const [revealURL, setURL] = useState("");

  useEffect(() => {
    if (id) {
      console.log("id is set")
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
      console.log("Setting joinURL:", joinURL);
    }
  }, [id]);

  return (
    <div className="waiting-room-box">

      <h1>Room ID: {id}</h1>
      <h2>Waiting Room</h2>
      <WaitingRoomInfoBox joinURL={revealURL}/>
      <ParticipantDisplayBox name={playerName}/>
    </div>
  );
}


