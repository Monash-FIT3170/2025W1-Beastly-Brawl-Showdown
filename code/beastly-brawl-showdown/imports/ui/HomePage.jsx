import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

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
<>
<h1>Home</h1>

<div>
  <button onClick={() => navigate("/host")}>Host Room</button>
  <button onClick={() => navigate("/join")}>Join Room</button>
</div>
</>