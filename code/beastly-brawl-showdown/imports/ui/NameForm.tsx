import React, { useState } from "react";

export const NameForm = ({ onSuccess }: { onSuccess: () => void }) => {
    const [text, setText] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!text) return;
    
        onSuccess();

        // Enter code to validate name here

    };

    return(
        <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter your name"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="buttons-container">
        <button className = "btn" type="submit">Continue</button>
      </div>
      
    </form>
    )
}
