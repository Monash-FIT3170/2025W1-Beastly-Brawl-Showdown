import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
//DELETE THIS FILE IF NOT BEING USED IN THE FUTURE- use JOINFORM.tsx AND JOINPAGE.tsx
export const JoinRoomPage = () => {
  return (
    <>
      <h1>Join an existing room</h1>
      <p>Room Code:</p>
      <JoinForm />
    </>
  );
};

export const InvalidCodeWarning = ({ enabled }) => {
  if (enabled) {
    return <b>Invalid room code.</b>;
  } else {
    return <b></b>;
  }
};

export const JoinForm = () => {
  const [text, setText] = useState("");
  const [isInvalidCodeSubmitted, setInvalidCodeSubmittedPopupState] =
    useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text) return;

    Meteor.call("requestJoinRoom", { roomCode: text }, (error, result) => {
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
      console.log("Successfully joined room:", result.submittedRoomCode);
      navigate(`/join/${result.submittedRoomCode}`);

    });
  };

  return (
    <>
      <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="e.g. 123456"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Submit Room Code</button>
      </form>
    </>
  );
};
