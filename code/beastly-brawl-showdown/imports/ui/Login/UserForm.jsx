import React, { useState } from "react";

export const UserForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassWord] = useState("");

  // todo: make this login the user or smth
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userName) return;

    // Replace this with real login logic
    console.log("Logging in with:", { userName, password });

    setUserName("");
    setPassWord("");
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
      <button>Sign Up</button>
      <button>Login As Guest</button>
    </form>
  );
};