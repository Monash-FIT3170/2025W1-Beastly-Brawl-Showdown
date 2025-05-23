import React from "react";

type MonsterContainerProps = {
    image: string; // URL for the image
    name: string;  // Unique identifier or display name
    func: (name: string) => void; // Callback function
};

export const MonsterContainer: React.FC<MonsterContainerProps> = ({ image, name, func }) => {
    function onClick() {
        func(name);
    }

    return (
        <div className="monsterContainer">
            <img src={image} id={name} className="monsterImage" onClick={onClick} />
        </div>
    );
};
