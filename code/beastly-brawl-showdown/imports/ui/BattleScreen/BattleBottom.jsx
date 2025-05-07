import React from 'react';


// Represents the bottom of the battle screen, contains buttons that for now triggers thte rolling animation
export const BattleBottom = ({ onRoll }) => {

    //function to show wthe rolling animation
    const handleRoll = () => {
        onRoll();
    };

    return (
    <div className="battleScreenBottom">
        <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className = "battleScreenBottomButtonImage" src="/img/sword.png" alt="Sword" />
        </button>
        <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className = "battleScreenBottomButtonImage" src="/img/ability.jpg" alt="Ability" />
        </button>
        <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className = "battleScreenBottomButtonImage" src="/img/shield.png" alt="Shield" />
        </button>
    </div>
    );
};