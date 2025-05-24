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
import { GameStates } from "/imports/api/GameStates";
import { useTracker } from "meteor/react-meteor-data";

export const Room = () => {
  const id = sessionStorage.getItem("roomId");
  const playerName = sessionStorage.getItem("guestName");

  console.log("Room component mounted");
  console.log("roomId from sessionStorage:", id);
  console.log("playerName from sessionStorage:", playerName);

  const [revealURL, setURL] = useState('');
>>>>>>> 2cda0dc (Initial Draft of client connecting to the server and then the server telling when all the clients can move to the monster selection page. Bug: Unable to change gameState correctly onces monster Selection has start):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx

  // Reactive tracker to subscribe and get the phase from DB
  const gameState = useTracker(() => {
    if (!id) {
      console.log("No roomId, skipping subscription");
      return null;
    }
    console.log("Subscribing to gameStatesByRoom for id:", id);
    const handle = Meteor.subscribe("gameStatesByRoom", id);
    if (!handle.ready()) {
      console.log("Subscription not ready yet");
      return null;
    }
    const gs = GameStates.findOne({ roomId: id });
    console.log("Fetched gameState:", gs);
    return gs;
  }, [id]);

  const localPhase = gameState?.phase || "waiting";

  useEffect(() => {
    if (joinCode) {
      const joinURL = Meteor.absoluteUrl(`/join/${joinCode}`);
      setURL(joinURL);
      console.log("Set joinURL:", joinURL);
    }
<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
  }, [joinCode]);
=======
  }, [id]);

  // Initialise the GameState to waiting
  useEffect(() => {
    if (id) {
      console.log("Calling gameStates.initialize for id:", id);
      Meteor.call("gameStates.initialize", id, (error: any) => {
        if (error) {
          console.error("Initialization failed:", error);
        } else {
          console.log("Game state initialized to waiting");
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

  // Set the Game State to monsterSelection for everyone
  const startMonsterSelection = () => {
    if (!id) {
      console.warn("No roomId, cannot start monster selection");
      return;
    }

    console.log("Calling gameStates.setPhase to monsterSelection for id:", id);
    Meteor.call("gameStates.setPhase", id, "monsterSelection", (error: any) => {
      if (error) {
        console.error("Failed to set phase:", error);
      } else {
        console.log("Phase set to 'monsterSelection' successfully");
      }
    });
  };

  console.log("Rendering Room component with localPhase:", localPhase);

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
