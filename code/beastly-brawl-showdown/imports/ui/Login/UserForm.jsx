import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassWord] = useState("");
  const navigate = useNavigate();

  // todo: make this login the user or smth
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName) return;

    // Replace this with real login logic
    console.log("Logging in with:", { userName, password });

    setUserName("");
    setPassWord("");
  };

  const handleGuestLogin = () => {
    // Replace this with guest login logic
    console.log("Logging in as guest");
    navigate("/homePage");
  };

  return (
    <form className="userForm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        type="text"
        placeholder="password, leave blank for guest"
        value={password}
        onChange={(e) => setPassWord(e.target.value)}
      />
      
      <button type="submit">Login</button>
      <button type="button">Sign Up</button>
      <button type="button" onClick = {handleGuestLogin}>Login As Guest</button>
    </form>
  );
};