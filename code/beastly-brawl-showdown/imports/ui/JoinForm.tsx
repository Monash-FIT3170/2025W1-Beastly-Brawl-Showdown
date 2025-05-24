import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
import { DDP } from "meteor/ddp";
// import "/imports/ui/global.css";

export const InvalidCodeWarning = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    return <b>Invalid room code.</b>;
  } else {
    return <b></b>;
  }
};

export const JoinForm = () => {
  const [inputJoinCode, setInputJoinCode] = useState("");
  const [inputDisplayName, setInputDisplayName] = useState(
    sessionStorage.getItem("displayName") ?? ""
  ); /// Load saved display name as default
  const [accountId, setAccountId] = useState(); // TODO - always nothing for now
  const [tempServerUrl, setTempServerUrl] = useState("");
  const [isInvalidCodeSubmitted, setInvalidCodeSubmittedPopupState] =
    useState(false);
  const navigate = useNavigate();

  const handleSubmitCode = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!inputJoinCode) return;

    const serverUrl = await new Promise<string>((resolve, reject) => {
      Meteor.call(
        "getServerConnection",
        inputJoinCode.trim(),
        (error: any, result: string) => {
          if (error) {
            console.log(error);
            // change state - show invalid code text
            setInvalidCodeSubmittedPopupState(true);
            reject(error);
          }

          console.log("Server URL:", result);
          setTempServerUrl(result);
          resolve(result);
        }
      );
    });
  };

  const handleSubmitName = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!inputJoinCode) return;
    if (!inputDisplayName) return;

    /// input validation

    const gameServerConnection = DDP.connect(tempServerUrl);
    gameServerConnection.call(
      "requestJoinRoom",
      inputJoinCode,
      inputDisplayName,
      accountId,
      (error: any, result) => {
        if (error) {
          console.log(error);
          // Toggle invalid display name
        }
        console.log("Join details valid. Response from server:", result);
      }
    );
    console.log("DONE CHAGNE PAGES");
    navigate(`/play`);
  };

  if (tempServerUrl == "") {
    /// No code submitted / recieved
    return (
      <>
        <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
        <form className="task-form" onSubmit={handleSubmitCode}>
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
  } else {
    return (
      <>
        <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
        <form className="task-form" onSubmit={handleSubmitName}>
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
};
