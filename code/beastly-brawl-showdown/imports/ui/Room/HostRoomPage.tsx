import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";

export const HostRoomPage = () => {
  const navigate = useNavigate();

  //get name for the person whos hosting it
  const playerName = sessionStorage.getItem("guestName")

  const onRequestRoom = () => {
    console.log(playerName)
    console.log("Requesting room...");
    Meteor.call("requestNewRoom", (error, result) => {
      if (error) {
        console.error("Error creating room:", error);
        return;
      }

      console.log("Room created with result:", result);
      console.log(`Moving host to room #${result.roomCode}`);
      navigate(`/h/${result.roomCode}/`);

    });
  };

  useEffect(() => {
    onRequestRoom();
  }, []);

  return (
    <>
      <p>Generating a new room...</p>
    </>
  );
};
