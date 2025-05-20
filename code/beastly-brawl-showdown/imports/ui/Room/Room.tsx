import { Meteor } from "meteor/meteor";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { generateQRCode } from "../../api/QRCode";

export const Room = () => {
  const { id, name } = useParams();

  //qrcode code
  const qrRef = useRef(null);
  const [revealURL, setURL] = useState(null);

  //get name from url
  const playerName = decodeURIComponent(name); 

  useEffect(() => {
    //check if id exists and qrRef is attached to the DOM
    if (qrRef.current && id) {
      //test
      //const joinURL = 'https://www.youtube.com/watch?v=IzoXcgG9X2k';

      //sets up the base url with room id
      // Meteor.absoluteUrl - used to set up base url (i.e http://project_domain_name)
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
      generateQRCode(qrRef.current, joinURL);
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
      <p>Room ID: {id}</p>

      <div ref={qrRef}></div>
      <p>Room Join Link: {revealURL}</p>
      <button onClick={copyToClipboard}>Copy Link</button>
    </div>
  );
};
