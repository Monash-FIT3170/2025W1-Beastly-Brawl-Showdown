import React, { useState } from "react";
import { Meteor } from 'meteor/meteor';
// import "/imports/ui/global.css";

export const JoinForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!text) return;

    onSuccess();

    Meteor.call("joinRoom", { roomId: text }, (error: Meteor.Error | null, result: { roomId: string }) => {
      if (!error) {
        console.log("Successfully joined room:", result);
        onSuccess();
      }
      else {
        alert("Please enter a valid room code! DEBUG: REMOVE onSuccess() @ Line 12 JoinForm.jsx")
      }
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add Room Code"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="buttons-container">
        <button className = "btn" type="submit">Continue</button>
      </div>
      
    </form>
  );
};
