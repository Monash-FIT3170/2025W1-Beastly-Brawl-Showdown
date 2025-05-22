import React from "react";
import { useNavigate } from "react-router-dom";
// import "/imports/ui/global.css";

export const HomePage = () => {
  const navigate = useNavigate();

  const handleGuestHostName = () =>{
    navigate(`/host/`)
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
