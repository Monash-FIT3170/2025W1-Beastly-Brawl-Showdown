import React from 'react';
import { ParticipantBox } from './ParticipantBox';

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
    const names = name.split(',').map(n => n.trim());

    return (
        <div className='participants-display-box'>
            {names.map((n) => (
                <ParticipantBox key={n} name={n} />
            ))}
        </div>
    )
}