import { Meteor } from "meteor/meteor";
import React, { useEffect,useState } from "react";
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";

export const Room = () => {
  const joinCode = sessionStorage.getItem("joinCode");
  //get name from session storage
  const playerName = sessionStorage.getItem("guestName"); 
  const [revealURL, setURL] = useState('');

  useEffect(() => {
    if (joinCode) {
      const joinURL = Meteor.absoluteUrl(`/join/${joinCode}`);
      setURL(joinURL);
    }
  }, [joinCode]);
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(revealURL)
      .then(() => console.log("Copied to clipboard!!"))
      .catch((error) => console.error("Copy failed:", error));
  };

  return (
    <div>
      <h1>Welcome {playerName}!</h1>
      <h1>ROOM VIEW</h1>
      <h1>Room ID: {joinCode}</h1>
      <br></br>

      <QRBox joinUrl={revealURL} />
      {CodeLink(revealURL)}

      <button onClick={copyToClipboard}>Copy Link</button>
    </div>
  );
};
