import React from 'react';
import { ParticipantBox } from './ParticipantBox';

export const ParticipantDisplayBox = ({ name }: { name: string }) => {
    return (
        <div className='participants-display-box'>
            <ParticipantBox name={name}/>
        </div>
    )
}