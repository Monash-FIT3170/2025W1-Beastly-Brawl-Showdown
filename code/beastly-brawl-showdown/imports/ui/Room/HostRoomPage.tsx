import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";

/** Sends request to host */
export const HostRoomPage = () => {
  const navigate = useNavigate();

  //get name for the person whos hosting it
  const playerName = sessionStorage.getItem("guestName");

  const onRequestRoom = () => {
    console.log("Requesting room...");
    Meteor.call(
      "requestHostRoom",
      (
        error: any,
        result: { serverUrl: string; roomId: number; joinCode: string }
      ) => {
        if (error) {
          console.error("Error creating room:", error);
          return;
        }

        console.log("Room created with result:", result);

        sessionStorage.setItem("serverUrl", result.serverUrl);
        sessionStorage.setItem("roomId", result.roomId.toString());
        sessionStorage.setItem("joinCode", result.joinCode);

        navigate(`/room/`);
      }
    );
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
