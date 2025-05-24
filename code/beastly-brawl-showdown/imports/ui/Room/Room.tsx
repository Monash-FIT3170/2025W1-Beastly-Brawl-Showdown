import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";

export const Room = () => {
  const id = sessionStorage.getItem("roomId");
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState('');

  const [localPhase, setLocalPhase] = useState("waiting");


  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
    }
  }, [id]);

  //Initialise the GameState to waiting
  useEffect(() => {
    if (id) {
      Meteor.call("gameStates.initialize", id, (error: any) => {
        if (error) console.error("Initialization failed:", error);
        else {
          console.log("Game state initialized to waiting");
          setLocalPhase("waiting");
        }
      });
    }
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(revealURL)
      .then(() => console.log("Copied to clipboard!!"))
      .catch((error) => console.error("Copy failed:", error));
  };

  //Set the Game State to monsterSelection for everyone
  const startMonsterSelection = () => {
    if (!id) return;

    Meteor.call("gameStates.setPhase", id, "monsterSelection", (error: any) => {
      if (error) {
        console.error("Failed to set phase:", error);
      } else {
        console.log("Phase set to 'monsterSelection' successfully");
        setLocalPhase("monsterSelection"); // update local state for instant UI feedback
      }
    });
  };


  return (
    <div>
      <h1>Welcome {playerName}!</h1>
      <h1>ROOM VIEW</h1>
      <h1>Room ID: {id}</h1>
      <h2>Current phase: {localPhase}</h2>
      <br />

      <QRBox joinURL={revealURL} />
      {CodeLink(revealURL)}

      <button onClick={copyToClipboard}>Copy Link</button>
      <button onClick={startMonsterSelection}>Start Monster Selection</button>
    </div>
  );
};
