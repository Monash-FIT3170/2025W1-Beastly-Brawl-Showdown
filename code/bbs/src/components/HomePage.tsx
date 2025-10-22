import React from "react";
import { useNavigate } from "react-router";
import { SelectMode } from "./SelectMode";
import { io, Socket } from "socket.io-client";
import type { HostClientToServerEvents, HostServerToClientEvents } from "../../../shared/types";


export const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);
  type HostSocket = Socket<HostServerToClientEvents, HostClientToServerEvents>;

  const handleHost = (roomType: "standard" | "random") => {
    const hostSocket: HostSocket = io("/host") as HostSocket;
    hostSocket.emit("requestRoom", roomType);
    navigate(`/host/${roomType}`);
  };

  //todo for the other type
  const handleType2 = () => {
    navigate("");
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
        //todo for the other mode
        onType2={() => {
          setShowModal(false);
          handleHost("random");
        }}
      />
    </div>
  );
};
