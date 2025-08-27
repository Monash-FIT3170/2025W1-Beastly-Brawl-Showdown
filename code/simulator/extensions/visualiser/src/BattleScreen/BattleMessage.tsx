import React, { useEffect } from "react";

interface BattleMessageProps {
  message: string;
}
useEffect

const BattleMessage: React.FC<BattleMessageProps> = ({ message }) => {
  
    useEffect(() => {
    if (!message) return;

    const messageEl = document.querySelector(".battle-message") as HTMLElement;
    messageEl?.setAttribute("style", "display:block;");

    const timeout = setTimeout(() => {
      messageEl?.setAttribute("style", "display:none;");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [message]);

  return (
    <div className={`battle-message${message ? " visible" : ""}`}>
      {message}
    </div>
  );
};

export default BattleMessage;
