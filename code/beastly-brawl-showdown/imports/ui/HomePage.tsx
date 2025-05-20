import React from "react";
import { useNavigate } from "react-router-dom";
// import "/imports/ui/global.css";

export default function HomePage() {
  const navigate = useNavigate();
  const guestName = sessionStorage.getItem("guestName")

  const handleGuestHostName = () =>{
    const safeGuestName = guestName ?? ""; // If null, use empty string, this gets rid of a red line on my ide
    navigate(`/host/${encodeURIComponent(safeGuestName)}`)
  };

  return (
    <div className="homepage-container">
      <div className="logo-container">Put logo here</div>
      <div className="buttons-container">
        <button className="btn host-btn" onClick={handleGuestHostName}>
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
      </div>
    </div>
  );
}