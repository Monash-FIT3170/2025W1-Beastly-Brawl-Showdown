import React from 'react';
import { ParticipantBox } from './ParticipantBox';

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
    return (
        <div className='participants-display-box'>
            <div className="participants-header">
                <div className="partcipants-count"></div>
                <button className="glb-btn start-game-btn">Start Game</button>
            </div>

            <div className="participants-grid">
                <ParticipantBox name={name}/>
            </div>
            
        </div>
    )
}