import React, { useState } from 'react';
import { CodeLink } from './CodeLink';
import { QRBox } from './QRBox';

export const WaitingRoomInfoBox = () => {
    return (
        <div className="waiting-room-info-box">
            <CodeLink />
            <QRBox />
        </div>
    )
    
}