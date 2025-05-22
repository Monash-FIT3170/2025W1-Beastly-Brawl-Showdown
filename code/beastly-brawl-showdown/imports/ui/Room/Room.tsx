import { Meteor } from "meteor/meteor";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";

export const Room = () => {
  const { id, name } = useParams();
  //get name from url
  const playerName = decodeURIComponent(name); 
  const [revealURL, setURL] = useState(String);

  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
    }
  }, [id]);
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
      <h1>Room ID: {id}</h1>
      <br></br>

      <QRBox joinURL={revealURL} />
      <CodeLink link={revealURL} />
      <button onClick={copyToClipboard}>Copy Link</button>
    </div>
  );
};
