
import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function WaitingRoom() {
  const { id, name } = useParams();
  //get name from url
  const playerName = decodeURIComponent(name); 
  const [revealURL, setURL] = useState(null);

  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
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


