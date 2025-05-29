import React from "react";

export const MonsterContainer = ({
  image,
  name,
  highlightAndShowConfirm,
}: {
  image: string;
  name: string;
  highlightAndShowConfirm: (name: string) => void;
}) => {
  /**
   * Onclick handler, sends name of selected monster back to selection screen
   */
  function onClick() {
    highlightAndShowConfirm(name);
  }

  return (
    <div className="monsterContainer">
      <img src={image} id={name} className="monsterImage" onClick={onClick} />
    </div>
  );
};   