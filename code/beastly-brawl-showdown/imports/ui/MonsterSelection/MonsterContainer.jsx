import React from "react";

export const MonsterContainer = ({image, name, func}) => {
    // Onclick handler
    function onClick() {
        func(name);
    }
    // // Dictate appearance on mouse hover
    // function onMouseOver() {
    //     let style = document.getElementById(name).style;
    //     style.border = "solid";
    //     style.borderWidth = "5px";
    //     style.borderColor = "black";
    // }

    // // Undo appearance change when mouse leaves
    // function onMouseLeave() {
    //     let style = document.getElementById(name).style;
    //     style.border = "none";
    // }

    return (
        <div class="monsterContainer">
            <img src={image} id={name} class="monsterImage" onClick={onClick}/>
        </div>
    )
}   