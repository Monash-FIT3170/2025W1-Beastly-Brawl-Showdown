import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassWord] = useState("");
  const navigate = useNavigate();

  // todo: make this login the user or smth
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!userName) return;

    // Replace this with real login logic
    console.log("Logging in with:", { userName, password });

    setUserName("");
    setPassWord("");
  };

  const handleGuestLogin = () => {
    console.log("Logging in as guest");
    // Storing guest login status and name, then navigate to home page
    sessionStorage.setItem("guestLoggedIn", "true");
    navigate("/guest-name?target=home");
  };


  return (
    <form className="userForm" onSubmit={handleSubmit}>
      <input className="form-textbox"
        type="text"
        placeholder="username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input className="form-textbox"
        type="text"
        placeholder="password"
        value={password}
        onChange={(e) => setPassWord(e.target.value)}
      />
      
      <button className="form-button" type="submit">Login</button>
      <button className="form-button" type="button">Sign Up</button>
      <button className="form-button" type="button" onClick = {handleGuestLogin}>Login As Guest</button>
    </form>
  );
};