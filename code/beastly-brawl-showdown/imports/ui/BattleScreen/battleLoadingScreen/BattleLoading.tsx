import React from "react";
import { PlayerAvater } from "./PlayerAvatar";

export const BattleLoadingScreen = () => {
  return (
    <div className="battle-loading-screen">
      <div className="battle-loading-container">
        <div className="player-container" id="top-player">
          <PlayerAvater />
        </div>

        <div className="vs-divider"></div>
        <div className="vs-text">VS</div>

        <div className="player-container" id="bottom-player">
          <PlayerAvater />
        </div>

        <div className="loading-text">
          Loading<span className="dots"></span>
        </div>
      </div>
    </div>
  );
};
