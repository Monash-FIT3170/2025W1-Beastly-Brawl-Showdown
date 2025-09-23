import React from "react";
import { useNavigate } from "react-router-dom";

//literally just a div, like nothing to see here
export const BattleTop: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/main")}
      className="glb-btn"
      id="battleScreenTop-btn"
    >
      Surrender
    </button>
  );
};
