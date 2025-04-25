import React from "react";
import { useNavigate } from "react-router-dom";
import "/imports/ui/global.css";

export default function JoinPage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <h1>Join Page</h1>
      <div className="buttons-container">
        <button className="btn name-btn" onClick={() => navigate("/name")}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
