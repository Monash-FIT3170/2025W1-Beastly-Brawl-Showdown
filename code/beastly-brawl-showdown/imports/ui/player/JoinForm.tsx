import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate, useParams } from "react-router-dom";
// import "/imports/ui/global.css";

export const InvalidCodeWarning = ({ enabled }: { enabled: boolean }) => {
  if (enabled) {
    return <b>Invalid room code.</b>;
  } else {
    return <b></b>;
  }
};

export const JoinForm = () => {
  const { joinCode: paramJoinCode } = useParams();
  console.log("Provided code from link:", paramJoinCode);
  const [inputJoinCode, setInputJoinCode] = useState(paramJoinCode ?? "");

  const [isInvalidCodeSubmitted, setInvalidCodeSubmittedPopupState] =
    useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!inputJoinCode) return;

    Meteor.call(
      "requestJoinRoom",
      { joinCode: inputJoinCode },
      (
        error: any,
        result: { isValidCode: boolean; submittedJoinCode: string }
      ) => {
        console.log(result);
        if (error) {
          console.log(error);
          // change state - show invalid code text
          return;
        }

        if (!result.isValidCode) {
          setInvalidCodeSubmittedPopupState(true);
          return;
        }
        console.log("Successfully joined room:", result.submittedJoinCode);
        navigate(`/play/`);
      }
    );
  };

  return (
    <>
      <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
      <form className="task-form" onSubmit={handleSubmit}>
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
};
