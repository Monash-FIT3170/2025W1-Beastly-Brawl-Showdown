import React, { useState } from 'react';
import { DisplayPanel } from './DisplayPanel';
import { TallPanels } from './TallPanels';
import { Buttons } from './Buttons';

export const DesignSystem = () => {
    return (
        <div className='design-system-page'>
            <DisplayPanel />
            <TallPanels />
            <Buttons />
        </div>
    )
}