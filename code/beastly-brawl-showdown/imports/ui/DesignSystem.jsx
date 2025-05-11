import React, { useState } from 'react';

export const DesignSystem = () => {
    return (
        <div className='design-system-page'>
            <div className="branding">
                <div className="title">Design</div>
                <div className="subtitle">System</div>
                <div className='team-name'>KahootLite</div>
            </div>

            <div className="icons">
                <div className="icons-header">Icons</div>
                <div className="icon-grid"></div>
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
            </div>
        </div>
    )
}