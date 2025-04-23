import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";
export const JoinRoomPage = () => {
  return (
    <>
      <h1>Join an existing room</h1>
      <p>Room Code:</p>
      <JoinForm />
    </>
  );
};

export const JoinForm = () => {
  const [text, setText] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text) return;

    Meteor.call("joinRoom", { roomId: text }, (error, result) => {
      if (!error) {
        console.log("Successfully joined room:", result);
        navigate(`/${result}`);
      }
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="e.g. 123456"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Submit Room Code</button>
    </form>
  );
};
