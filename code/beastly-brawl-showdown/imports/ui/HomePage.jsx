import React from "react";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1>Home</h1>

      <div>
        <button onClick={() => navigate("/host")}>Host Room</button>
        <button onClick={() => navigate("/join")}>Join Room</button>
      </div>
    </>
  );
};
