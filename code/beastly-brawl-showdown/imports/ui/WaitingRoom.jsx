import React from 'react';
import { WaitingRoomInfoBox } from './WaitingRoomInfoBox';
import { ParticipantDisplayBox } from './ParticipantDisplayBox';

export const WaitingRoom = () => (
    <div className='waiting-room-box'>
        <WaitingRoomInfoBox />
        <ParticipantDisplayBox />
    </div>
)