import React from "react";
import { Meteor } from "meteor/meteor";

export const HostRoomPage = () => {
  const onRequestRoom = () => {
    console.log("Requesting room...");
    Meteor.call("createRoom", (error, result) => {
      if (error) {
        console.error("Error creating room:", error);
      } else {
        console.log("Room created:", result);
      }
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
