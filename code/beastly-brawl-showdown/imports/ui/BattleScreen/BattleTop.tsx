import React from 'react';
import { useNavigate } from 'react-router-dom';

//literally just a div, like nothing to see here
export const BattleTop: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="battleScreenTop">
      <img className="topBackIcon" src="/img/back_line.png" alt="back" />
      {/*should change the main to be the screen to go back too after surrendering */}
      <button onClick={() => navigate('/main')} className="battleScreenTopButton">
        Surrender
      </button>
    </div>
  );
};
