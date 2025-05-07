import React from "react";

export const MonsterContainer = ({image, name}) => {
    return (
        <div className="monsterContainer">
            <img src={image} className={name}/>
        </div>
    )
}   