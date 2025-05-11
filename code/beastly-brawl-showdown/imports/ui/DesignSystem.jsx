import React, { useState } from 'react';
import { DisplayPanel } from './DisplayPanel';
import { PlayerName } from './PlayerName';
import { TallPanels } from './TallPanels';

export const DesignSystem = () => {
    return (
        <div className='design-system-page'>
            <DisplayPanel />
            <TallPanels />
        </div>
    )
}