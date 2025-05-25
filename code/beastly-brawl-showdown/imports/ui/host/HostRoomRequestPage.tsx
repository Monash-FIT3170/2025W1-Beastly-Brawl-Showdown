import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate} from "react-router-dom";

export const HostRoomRequestPage = () => {
  const navigate = useNavigate();

  //get name for the person whos hosting it
  const playerName = sessionStorage.getItem("guestName")

  const onRequestRoom = () => {
    console.log(playerName)
    console.log("Requesting room...");
    Meteor.call("requestNewRoom", (error: any, result: { joinCode: string; }) => {
      if (error) {
        console.error("Error creating room:", error);
        return;
      }

      console.log("Room created with result:", result);
      console.log(`Moving host to room #${result.joinCode}`);
      sessionStorage.setItem("joinCode", result.joinCode);
      navigate(`/host/`);

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
