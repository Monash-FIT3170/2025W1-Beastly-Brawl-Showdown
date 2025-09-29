import React from "react";

interface BattleMessageProps {
  message: string;
}

const BattleMessage: React.FC<BattleMessageProps> = ({ message }) => {
  return <div className="battle-message">{message}</div>;
};

export default BattleMessage;
