import React from 'react';
import { WaitingRoomInfoBox } from './WaitingRoomInfoBox';
import { ParticipantBox } from './ParticipantsBox';

export const WaitingRoom = () => (
    <div className='waiting-room-box'>
        <WaitingRoomInfoBox />
        <ParticipantBox />
    </div>
)