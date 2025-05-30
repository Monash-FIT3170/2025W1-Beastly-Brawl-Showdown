import React from "react";

export const MonsterContainer = ({
  image,
  name,
  currentlySelectedMonster,
}: {
  image: string;
  name: string;
  currentlySelectedMonster: (name: string) => void;
}) => {
    
  /**
   * Onclick handler, sends name of selected monster back to selection screen
   */
  function onClick() {
    currentlySelectedMonster(name);
  }

  return (
    <div className="monsterContainer">
      <img src={image} id={name} className="monsterImage" onClick={onClick} />
    </div>
  );
};   