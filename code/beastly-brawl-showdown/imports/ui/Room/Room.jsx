import React from "react";
import { useParams } from "react-router-dom";

export const Room = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>ROOM VIEW</h1>
      <p>Room ID: {id}</p>
    </div>
  );
};
