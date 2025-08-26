import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "../socket/socket_context";

const PlayerConnectionPage: React.FC = () => {
  const [playerName, setPlayerName] = useState("");
  const [serverAddress, setServerAddress] = useState("localhost:3000");
  const navigate = useNavigate();
  const socketContext = useContext(SocketContext);
  if (!socketContext) {
    return (
      <>
        <p>Error: Expected a socket context</p>
      </>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !serverAddress.trim()) {
      alert("Please enter both a player name and a server address.");
      return;
    }

    if (!socketContext.socket) {
      console.log("Replacing socket...");
    }

    const newSocket = io(`http://${serverAddress}`, {
      auth: { name: playerName, monsterTemplate: 1 },
      transports: ["websocket"],
    });
    socketContext.setSocket(newSocket);

    navigate("/");
  };

  return (
    <>
      <h1>Join Game Server</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="playerName">Player Name</label>
          <input id="playerName" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" />
        </p>
        <p>
          <label htmlFor="serverAddress">Server (IP:Port)</label>
          <input id="serverAddress" type="text" value={serverAddress} onChange={(e) => setServerAddress(e.target.value)} placeholder="e.g. 127.0.0.1:3000" />
        </p>
        <p>
          <button type="submit">Connect</button>
        </p>
      </form>
    </>
  );
};

export default PlayerConnectionPage;
