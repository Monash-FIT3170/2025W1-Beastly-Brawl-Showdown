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
      <div className="logo"></div>
      <div className="buttons-container">
        <button className="glb-btn" onClick={handleGuestHostName}>
          HOST
        </button>
        <button className="glb-btn join-btn" onClick={() => navigate("/join")}>
          JOIN
        </button>
        <button
          className="glb-btn"
          onClick={() => navigate("/settings")}
        >
          SETTINGS
        </button>
      </div>
    </div>
  );
}
