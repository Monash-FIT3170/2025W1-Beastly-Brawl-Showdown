import { Meteor } from "meteor/meteor";
import React from "react";
import { useNavigate } from "react-router-dom";
// import "/imports/ui/global.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="logo-container">Put logo here</div>
      <div className="buttons-container">
        <button className="btn host-btn" onClick={() => navigate("/host")}>
          HOST
        </button>
        <button className="btn join-btn" onClick={() => navigate("/join")}>
          JOIN
        </button>
        <button
          className="btn settings-btn"
          onClick={() => navigate("/settings")}
        >
          SETTINGS
        </button>



        
        <button
          className="btn settings-btn"
          onClick={() => { console.log("Requesting room to host..."); Meteor.call("room.requestHostRoom", {}, () => null) }}
        >
          HOST REQUEST
        </button>
      </div>
    </div>
  );
}
