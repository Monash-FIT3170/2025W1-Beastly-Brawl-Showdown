import React from "react";

export const MonsterContainer = ({image, name, func}) => {
    /**
     * Onclick handler
     */
    function onClick() {
        func(name);
    }

    return (
        <div className="monsterContainer">
            <img src={image} id={name} className="monsterImage" onClick={onClick}/>
        </div>
    )
}   