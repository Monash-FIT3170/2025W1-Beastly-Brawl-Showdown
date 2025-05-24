import { CodeLink } from '../CodeLink';
import { QRBox } from '../QRBox';
import React from "react";

export const WaitingRoomInfoBox = ({ joinURL }: { joinURL: string }) => {
    return (
        <div className="waiting-room-info-box">
            {CodeLink(joinURL)}

            <QRBox joinURL={joinURL} />
        </div>
    )
    
}