import { Meteor } from "meteor/meteor";
import React, { useEffect, useState } from "react";
import { QRBox } from "../../host/projector/QRBox";
import { CodeLink } from "../../host/projector/CodeLink";

export const Room = () => {
  const joinCode = sessionStorage.getItem("joinCode");
  //get name from session storage
  const playerName = sessionStorage.getItem("guestName");
  const [revealURL, setURL] = useState("");

  const gameState = useTracker(() => {
    if (!id) return null;
    Meteor.subscribe("gameStatesByRoom", id);
    return GameStates.findOne({ roomId: id });
  }, [id]);

  const currentPhase = gameState?.phase;

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

<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
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
=======
>>>>>>> 1c03746 (Host is now able to fully tell the clients when to swtich pages and there are no more bugs of stuck GameStates):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx
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
<<<<<<< HEAD:code/beastly-brawl-showdown/imports/ui/player/game/Room.tsx
      <h1>Room ID: {joinCode}</h1>
      <br></br>
=======
      <h1>Room ID: {id}</h1>
      <h2>Current Phase: {currentPhase}</h2>
      <br />
>>>>>>> 2cda0dc (Initial Draft of client connecting to the server and then the server telling when all the clients can move to the monster selection page. Bug: Unable to change gameState correctly onces monster Selection has start):code/beastly-brawl-showdown/imports/ui/Room/Room.tsx

      <QRBox joinUrl={revealURL} />
      {CodeLink(revealURL)}

      <button onClick={copyToClipboard}>Copy Link</button>
      <button onClick={startMonsterSelection}>Start Monster Selection</button>
    </div>
  );
};
