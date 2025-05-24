import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export const PlayerPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>PLAYER VIEW</h1>
      <p>Room ID: {id}</p>
    </div>
  );
};
