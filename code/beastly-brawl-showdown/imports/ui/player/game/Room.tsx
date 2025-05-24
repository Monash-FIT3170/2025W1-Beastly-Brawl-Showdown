import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
import { QRBox } from "../../host/projector/QRBox";
import { CodeLink } from "../../host/projector/CodeLink";

export const Room = () => {
  const joinCode = sessionStorage.getItem("joinCode");
  //get name from session storage
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState("");
=======
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";

export const Room = () => {
  const id = sessionStorage.getItem("roomId");
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState('');
>>>>>>> 2cda0dc (Initial Draft of client connecting to the server and then the server telling when all the clients can move to the monster selection page. Bug: Unable to change gameState correctly onces monster Selection has start):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx

  const [localPhase, setLocalPhase] = useState("waiting");


  useEffect(() => {
    if (joinCode) {
      const joinURL = Meteor.absoluteUrl(`/join/${joinCode}`);
      setURL(joinURL);
    }
<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
  }, [joinCode]);
=======
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

>>>>>>> 2cda0dc (Initial Draft of client connecting to the server and then the server telling when all the clients can move to the monster selection page. Bug: Unable to change gameState correctly onces monster Selection has start):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx
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
<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
      <h1>Room ID: {joinCode}</h1>
      <br></br>
=======
      <h1>Room ID: {id}</h1>
      <h2>Current phase: {localPhase}</h2>
      <br />
>>>>>>> 2cda0dc (Initial Draft of client connecting to the server and then the server telling when all the clients can move to the monster selection page. Bug: Unable to change gameState correctly onces monster Selection has start):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx

      <QRBox joinUrl={revealURL} />
      {CodeLink(revealURL)}

      <button onClick={copyToClipboard}>Copy Link</button>
      <button onClick={startMonsterSelection}>Start Monster Selection</button>
    </div>
  );
};
