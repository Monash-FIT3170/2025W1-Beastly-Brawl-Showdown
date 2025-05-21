import React, { useState } from "react";
import { Meteor } from 'meteor/meteor';
import { useNavigate } from "react-router-dom";
// import "/imports/ui/global.css";

export const InvalidCodeWarning = ({ enabled }) => {
  if (enabled) {
    return <b>Invalid room code.</b>;
  } else {
    return <b></b>;
  }
};

export const JoinForm = ({ onSuccess }: { onSuccess: () => void }) => {
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
    <InvalidCodeWarning enabled={isInvalidCodeSubmitted} />
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
