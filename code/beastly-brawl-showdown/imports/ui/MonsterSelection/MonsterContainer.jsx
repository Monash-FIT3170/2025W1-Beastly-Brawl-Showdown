import React from "react";

export const MonsterContainer = ({image, name}) => {
    return (
        <div class="monsterContainer">
            <img src={image} id={name} class="monster"/>
        </div>
    )
}   