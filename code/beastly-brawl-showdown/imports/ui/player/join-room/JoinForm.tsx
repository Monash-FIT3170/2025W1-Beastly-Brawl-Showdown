import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";

export const InvalidCodeWarning = ({ enabled }: { enabled: boolean }) => {
    return enabled ? <b>Invalid room code.</b> : null;
};

export const JoinForm = () => {
    const { joinCode: linkParamJoinCode } = useParams();
    const navigate = useNavigate();

    const [inputJoinCode, setInputJoinCode] = useState(linkParamJoinCode ?? "");
    const [isJoinCodeValid, setJoinCodeValid] = useState(false);
    const [inputDisplayName, setInputDisplayName] = useState(
        sessionStorage.getItem("displayName") ?? ""
    );
    const [isDisplayNameValid, setDisplayNameValid] = useState(false);

    const [serverUrl, setServerUrl] = useState<string>();
    const [isInvalidCodeSubmitted] = useState(false);

    //#region Startup - get best server URL
    useEffect(() => {
        if (!serverUrl) {
            Meteor.call("getBestServerUrl", (error: any, result: string) => {
                if (error) return console.error("Error locating server:", error);
                setServerUrl(result);
                console.log("Server found at:", result);
            });
        }
    }, [serverUrl]);
    //#endregion

    //#region Auth Precheck
    const handleSubmitAuth = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!inputJoinCode) return;

        try {
            const response = await fetch(serverUrl + "/player-auth-precheck", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ joinCode: inputJoinCode, displayName: inputDisplayName }),
            });
            const data = await response.json();

            setJoinCodeValid(data.isJoinCodeValid === true);
            setDisplayNameValid(data.isDisplayNameValid === true);

            console.log("Join code valid:", data.isJoinCodeValid);
            console.log("Display name valid:", data.isDisplayNameValid);
        } catch (error) {
            console.error("Error:", error);
        }
    };
    //#endregion

    //#region Redirect on valid input
    useEffect(() => {
        if (isJoinCodeValid && isDisplayNameValid && serverUrl) {
            sessionStorage.setItem("joinCode", inputJoinCode);
            sessionStorage.setItem("displayName", inputDisplayName);
            sessionStorage.setItem("serverUrl", serverUrl);

            console.log("Go to game...");
            navigate(`/play`);
        }
    }, [isJoinCodeValid, isDisplayNameValid, inputJoinCode, inputDisplayName, serverUrl, navigate]);
    //#endregion

    if (!serverUrl) return <p>Connecting to servers...</p>;

    if (!isJoinCodeValid) {
        return (
            <>
                <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
                <form className="task-form" onSubmit={handleSubmitAuth}>
                    <input
                        className="form-textbox"
                        type="text"
                        placeholder="Add Room Code"
                        value={inputJoinCode}
                        onChange={(e) => setInputJoinCode(e.target.value)}
                    />
                    <div className="buttons-container">
                        <button className="glb-btn" type="submit">Continue</button>
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
                        className="form-textbox"
                        type="text"
                        placeholder="Display Name"
                        value={inputDisplayName}
                        onChange={(e) => setInputDisplayName(e.target.value)}
                    />
                    <div className="buttons-container">
                        <button className="glb-btn" type="submit">Go!</button>
                    </div>
                </form>
            </>
        );
    }

  return (
    <>
      <p>Starting game...</p>
    </>
  );
};
