import React from 'react';


// The top of the battlescreen, should just contain a back button
export const BattleTop = () => (
    <div className = "battleScreenTop">
        <img className="topBackIcon" src="/img/back_line.png" alt="back" />
        <button onClick={() => navigate("/main")} className = "battleScreenTopButton">Surrender</button>
    </div>
);
//the navigate should be changed to a homescreen or something?