import React from "react";

export const MonsterContainer = ({image, name, func}) => {
    /**
     * Onclick handler
     */
    function onClick() {
        func(name);
    }

    return (
        <div class="monsterContainer">
            <img src={image} id={name} class="monsterImage" onClick={onClick}/>
        </div>
    )
}   