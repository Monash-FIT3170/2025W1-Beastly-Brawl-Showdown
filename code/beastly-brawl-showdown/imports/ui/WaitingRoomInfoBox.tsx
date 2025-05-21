import React, { useState } from 'react';
import { CodeLink } from './CodeLink';
import { QRBox } from './QRBox';

export const WaitingRoomInfoBox = ({ joinURL }: { joinURL: string }) => {
    return (
        <div className="waiting-room-info-box">
            <CodeLink link={joinURL} />
            <QRBox joinURL={joinURL} />
        </div>
    )
    
}