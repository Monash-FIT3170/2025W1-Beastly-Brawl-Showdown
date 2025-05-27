import React from 'react';
import { ParticipantBox } from './ParticipantBox';

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
    const names = name.split(',').map(n => n.trim());

    return (
        <div className='participants-display-box'>
            <div className="participants-header">
                <div className="partcipants-count"></div>
                <button className="glb-btn start-game-btn">Start Game</button>
            </div>

            {names.map((n) => (
                <ParticipantBox key={n} name={n} />
            ))}
            

        </div>
    )
}