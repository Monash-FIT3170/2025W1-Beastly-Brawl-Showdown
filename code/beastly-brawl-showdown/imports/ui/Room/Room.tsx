import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";
import { useTracker } from "meteor/react-meteor-data";
import { GameStates } from "../../api/DataBases";

export const Room = () => {
  const id = sessionStorage.getItem("roomId");
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState('');

  const gameState = useTracker(() => {
    if (!id) return null;
    Meteor.subscribe("gameStatesByRoom", id);
    return GameStates.findOne({ roomId: id });
  }, [id]);

  const currentPhase = gameState?.phase;

  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
      console.log("Set joinURL:", joinURL);
    }
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(revealURL)
      .then(() => console.log("Copied to clipboard!!"))
      .catch((error) => console.error("Copy failed:", error));
  };

  // Set the Game State to monsterSelection for everyone
  const startMonsterSelection = async () => {
    if (!id) return;

    try {
      await Meteor.callAsync("gameStates.setPhase", id, "monsterSelection");
      console.log("Phase set to 'monsterSelection' successfully");
    } catch (error) {
      console.error("Failed to set phase:", error);
    }
  };

  return (
    <div>
      <h1>Welcome {playerName}!</h1>
      <h1>ROOM VIEW</h1>
      <h1>Room ID: {id}</h1>
      <h2>Current Phase: {currentPhase}</h2>
      <br />

      <QRBox joinURL={revealURL} />
      {CodeLink(revealURL)}

      <button onClick={copyToClipboard}>Copy Link</button>
      <button onClick={startMonsterSelection}>Start Monster Selection</button>
    </div>
  );
};
