import React from "react";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  //pass the name of the guest person 
  const navigate = useNavigate();
  const guestName = sessionStorage.getItem("guestName");

  // go to the host room setup with the guests name in the URL
  const handleGuestHostName = () => {
    navigate(`/host/${encodeURIComponent(guestName)}`);
  };
  return (
    <>
      <h1>Home</h1>
      <h1>Welcome {guestName}!</h1>
      <div>
        <button onClick={handleGuestHostName}>Host Room</button>
        <button onClick={() => navigate("/join")}>Join Room</button>
      </div>
    </>
  );
};
