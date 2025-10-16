import React from "react";
import { useNavigate } from "react-router";
import { usePlayerSocket } from "../player/game/PlayerPage";
import { Socket } from "socket.io-client";

// Extend the socket type to include "surrender"
interface PlayerSocketEvents {
  surrender: () => void;
  // add any other events you use here if needed
}

export const BattleTop: React.FC = () => {
  const navigate = useNavigate();
  const { socket } = usePlayerSocket();

  return (
    <button
      onClick={() => {
        // navigate back to main
        navigate("/main");

        // emit surrender event safely
        if (socket) (socket as unknown as Socket<PlayerSocketEvents>).emit("surrender");
      }}
      className="glb-btn"
      id="battleScreenTop-btn"
    >
      Surrender
    </button>
  );
};
