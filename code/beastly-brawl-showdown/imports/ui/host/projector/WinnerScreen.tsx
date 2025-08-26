import React from "react";

type WinnerScreenProps = {
  winnerName: string;
};

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winnerName }) => (
  <div className="canvas-body" id="winner-screen">
    <div className="winner-screen">
      <h1>Winner!</h1>
      <p>{winnerName}</p>
      <p>Congratulations!</p>
    </div>
  </div>
);

export default WinnerScreen;
