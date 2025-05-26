import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { UnderConstruction } from "../../error/UnderConstruction";
// import "/imports/ui/global.css";

export const InvalidCodeWarning = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    return <b>Invalid room code.</b>;
  } else {
    return <b></b>;
  }
};

export const JoinForm = () => {
  const { joinCode: linkParamJoinCode } = useParams();
  console.log(`Extracted room code from link: <${linkParamJoinCode}>`);
  const [inputJoinCode, setInputJoinCode] = useState(linkParamJoinCode ?? "");
  const [isJoinCodeValid, setJoinCodeValid] = useState(false);
  const [inputDisplayName, setInputDisplayName] = useState(
    sessionStorage.getItem("displayName") ?? ""
  ); /// Load saved display name as default
  const [isDisplayNameValid, setDisplayNameValid] = useState(false);

  const [serverUrl, setServerUrl] = useState<string>();
  // const [accountId, setAccountId] = useState(); // TODO - always nothing for now
  // const [roomId, setRoomId] = useState<number>();

  const [isInvalidCodeSubmitted, setInvalidCodeSubmittedPopupState] =
    useState(false);
  const navigate = useNavigate();

  //#region Startup
  if (!serverUrl) {
    /// Try get best server url
    Meteor.call("getBestServerUrl", (error: any, result: string) => {
      if (error) {
        console.error("Error locating room:", error);
        return;
      }

      console.log("Server found at:", result);
      setServerUrl(result);
    });

    return (
      <>
        <p>Connectng to servers...</p>
      </>
    );
  }

  // // Connect to game server
  // const socket = io(serverUrl + "/player");
  // socket.on("connect", () => {
  //   console.log("Connected to server");

  //   // Send a test message
  //   socket.emit("message", "Hello from Projector!");
  // });

  // socket.on("connect_error", (err: Error) => {
  //   console.error(`Connection failed: ${err.message}`);
  // });

  // socket.on("disconnect", () => {
  //   console.log("Disconnected from server");
  // });

  // socket.on("echo", (msg: string) => {
  //   console.log(`Server says: ${msg}`);
  // });
  // //#endregion

  //#region Try join
  const handleSubmitAuth = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!inputJoinCode) return;

    fetch(serverUrl + "/player-auth-precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        joinCode: inputJoinCode,
        displayName: inputDisplayName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isJoinCodeValid === true) {
          console.log("Join code valid.");
          setJoinCodeValid(true);
        } else {
          console.log("Invalid join code:", data);
          setJoinCodeValid(false);
        }

        if (data.isDisplayNameValid === true) {
          console.log("Display name valid.");
          setDisplayNameValid(true);
        } else {
          console.log("Invalid display name:", data);
          setDisplayNameValid(false);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  if (!isJoinCodeValid) {
    /// No code submitted / recieved
    return (
      <>
        <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
        <form className="task-form" onSubmit={handleSubmitAuth}>
          <input
            type="text"
            placeholder="Add Room Code"
            value={inputJoinCode}
            onChange={(e) => setInputJoinCode(e.target.value)}
          />
          <div className="buttons-container">
            <button className="btn" type="submit">
              Continue
            </button>
          </div>
        </form>
      </>
    );
  }
  if (!isDisplayNameValid) {
    return (
      <>
        <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
        <form className="task-form" onSubmit={handleSubmitAuth}>
          <input
            type="text"
            placeholder="Display Name"
            value={inputDisplayName}
            onChange={(e) => setInputDisplayName(e.target.value)}
          />
          <div className="buttons-container">
            <button className="btn" type="submit">
              Go!
            </button>
          </div>
        </form>
      </>
    );
  }

  if (isJoinCodeValid && isDisplayNameValid) {
    sessionStorage.setItem("joinCode", inputJoinCode);
    sessionStorage.setItem("displayName", inputDisplayName);
    console.log("Go to game...");
    navigate(`/play`);
  }
  return (
    <>
      <p>Starting game...</p>
    </>
  );
};
