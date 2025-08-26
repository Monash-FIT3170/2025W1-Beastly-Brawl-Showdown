import React from "react";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();

  const handleGuestHostName = () => {
    navigate(`/host/`);
  };

  return (
    <div className="canvas-body" id="homepage">
      <div className="homepage-container">
        <div className="logo"></div>
        <div className="buttons-container">
          <button className="glb-btn" onClick={handleGuestHostName}>
            HOST
          </button>
          <button className="glb-btn " onClick={() => navigate("/join")}>
            JOIN
          </button>
        </div>
      </div>
    </div>
  );
};
