import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";


export const GuestNamePage = () => {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    const [name, setName] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;
            navigate(`/room/${roomCode}/${encodeURIComponent(name)}`);
  }
  return (
    <>
        <h1>Enter Your Name:</h1>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Your name..." value={name} onChange={(e) => setName(e.target.value)}></input>
        </form> 
    </>
  );
};
