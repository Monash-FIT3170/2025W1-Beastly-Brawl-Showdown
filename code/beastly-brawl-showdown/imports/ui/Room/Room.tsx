import { Meteor } from "meteor/meteor";
import React, { useEffect,useState } from "react";
import { CodeLink } from "../CodeLink";
import { QRBox } from "../QRBox";

export const Room = () => {
  const id = sessionStorage.getItem("roomId");

  //get name from session storage
  const [revealURL, setURL] = useState('');

  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
    }
  }, [id]);

  return (
    <div className="waiting-room-box">
        <div className="waiting-room-info-box">
            <div className="room-code">
                {id}
            </div>

            {CodeLink(revealURL)}
            
            <QRBox joinURL={revealURL} />
        </div>

        <div className="participants-display-box">
            <div className="participants-header">
                <div className="partcipants-count"></div>
                <button className="glb-btn start-game-btn">Start Game</button>
            </div>
        </div>
    </div>
  );
};
