import React from "react";
import { useNavigate } from "react-router-dom";
import { SelectMode } from "./SelectMode";
import { usePlayerSocket } from "./player/game/PlayerPage";

export const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  const { socket } = usePlayerSocket();

  const handleHost = (type: "standard" | "random") => {
    // Tell the server to create a room with this mode
    if (socket) {
      socket.emit("request-room", { type }); 
      // Server will respond with room code / confirmation
    }

    navigate(`/host/${type}`); // can later pass room id if needed
  };

  return (
    <div className="canvas-body" id="homepage">
      <div className="homepage-container">
        <div className="logo"></div>
        <div className="buttons-container">
          <button className="glb-btn" onClick={() => setShowModal(true)}>
            HOST
          </button>
          <button className="glb-btn " onClick={() => navigate("/join")}>
            JOIN
          </button>
        </div>
      </div>

      <SelectMode
        open={showModal}
        onClose={() => setShowModal(false)}
        onType1={() => {
          setShowModal(false);
          handleHost("standard");
        }}
        onType2={() => {
          setShowModal(false);
          handleHost("random");
        }}
      />
    </div>
  );
};