import React, { useState } from 'react';
import { CodeLink } from './CodeLink.jsx';
import { QRBox } from './QRBox.jsx';

export const WaitingRoomInfoBox = () => {
    return (
        <div className="waiting-room-info-box">
            <CodeLink />
            <QRBox />
        </div>
    )
    
}