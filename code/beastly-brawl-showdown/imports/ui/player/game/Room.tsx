import { Meteor } from "meteor/meteor";
import React, { useEffect,useState } from "react";
import { CodeLink } from "../../host/projector/CodeLink";
import { QRBox } from "../../host/projector/QRBox";

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

            <QRBox joinUrl={revealURL} />
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
