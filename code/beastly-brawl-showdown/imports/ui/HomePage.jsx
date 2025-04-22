import React from "react";
import { useNavigate } from "react-router-dom";
import "/imports/ui/global.css";

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
      </div>
    </div>
  );
}
