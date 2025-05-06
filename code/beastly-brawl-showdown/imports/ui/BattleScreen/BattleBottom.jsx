import React from 'react';

export const BattleBottom = () => {
    const handleRoll = () => {
    // TODO: Add roll animation logic here
    alert('Rolling...'); // placeholder
    };

    return (
    <div className="battleScreenBottom">
        <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className = "battleScreenBottomButtonImage" src="/img/sword.png" alt="Sword" />
        </button>
        <button className="battleScreenBottomButton" onClick={handleRoll}>
        <img className = "battleScreenBottomButtonImage" src="/img/shield.png" alt="Shield" />
        </button>
    </div>
    );
};