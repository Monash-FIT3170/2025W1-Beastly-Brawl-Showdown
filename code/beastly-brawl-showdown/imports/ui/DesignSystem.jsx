import React, { useState } from 'react';
import { DarkBrownBtn } from './buttonComponents/DarkBrownBtn';
import { LightBrownBtn } from './buttonComponents/LightBrownBtn';
import { BrownBtn } from './buttonComponents/BrownBtn';
import { BtnDefault } from './buttonComponents/BtnDefault';
import { BrownCheck } from './buttonComponents/BrownCheck';
import { BrownCross } from './buttonComponents/BrownCross';
import { AtkBtn } from './buttonComponents/AtkBtn';
import { ShieldBtn } from './buttonComponents/shieldBtn';
import { VolumeIcon } from './icons/VolumeIcon';
import { VolumeMuted } from './icons/VolumeMuted';
import { SfxIcon } from './icons/SfxIcon';
import { SfxMuted } from './icons/SfxMuted';
import { UpArrow } from './icons/UpArrow';
import { DownArrow } from './icons/DownArrow';
import { LeftArrow } from './icons/LeftArrow';
import { RightArrow } from './icons/RightArrow';
import { SettingsIcon } from './icons/SettingsIcon';
import { HomeIcon } from './icons/HomeIcon';
import { MoneyIcon } from './icons/MoneyIcon';

export const DesignSystem = () => {
    return (
        <div className='design-system-page'>
            <div className='branding'>
                <div className="title">Design</div>
                <div className="subtitle">System</div>
                <div className='team-name'>KahootLite</div>
            </div>

            <div className="icons">
                <div className="icons-header">Icons</div>
                <div className="icon-grid">
                    <VolumeIcon />
                    <VolumeMuted />
                    <SfxIcon />
                    <SfxMuted />

                    <UpArrow />
                    <DownArrow />
                    <LeftArrow />
                    <RightArrow />

                    <SettingsIcon />
                    <HomeIcon />
                    <MoneyIcon />
                    
                </div>
            </div>

            <div className="patterns-top">
                <div className="patterns-header">Patterns</div>
            </div>

            <div className='typography'>
                <div className='typography-header'>Typography</div>
                <div className="typography-sample">
                    <div className="sample-box">
                        <div className="font-size: 5rem; line-height: 1;">Aa</div>
                    </div>
                    <div className="type-examples">
                        <div className="type-large">Title Large Meta</div>
                        <div className="type-medium">Title Medium Meta</div>
                        <div className="type-small">Title Small Meta</div>
                    </div>
                </div>

                <div className="color-section">
                    <div className="color-header">Color</div>
                    <div className="color-grid">
                        <div className="color-circle circle-blue"></div>
                        <div className="color-circle circle-mid-blue"></div>
                        <div className="color-circle circle-light-blue"></div>
                        <div className="color-text-black circle-white">Aa</div>
                        <div className="color-text circle-black">Aa</div>

                        <div className="color-circle circle-green"></div>
                        <div className="color-circle circle-mid-green"></div>
                        <div className="color-circle circle-light-green"></div>
                        <div className="color-text circle-light-brown">Aa</div>
                        <div className="color-text circle-dark-brown">Aa</div>

                        <div className="color-circle circle-redish-brown"></div>
                        <div className="color-circle circle-dark-orange"></div>
                        <div className="color-circle circle-orange"></div>
                        <div className="color-text circle-mid-orange">Aa</div>
                        <div className="color-text circle-light-orange">Aa</div>
                    </div>
                </div>
            </div>

            <div className="components">
                <div className="components-header">Components</div>
                <div className="components-container">
                    <div className="button-column">
                        <DarkBrownBtn />
                        <BrownBtn />
                        <LightBrownBtn />
                        <BtnDefault />
                    </div>
                    
                    <div className="button-column" id='small-btns'>
                        <BrownCheck />
                        <BrownCross />
                        <AtkBtn />
                        <ShieldBtn />
                    </div>
                </div>
            </div>

            <div className='patterns-bottom'>
                <div className='patterns-header' id='patterns-header-bottom'>Patterns</div>
                <img src='/Panel 1.png' alt='Panel' className='name-board' />


            </div>
        </div>
    )
}