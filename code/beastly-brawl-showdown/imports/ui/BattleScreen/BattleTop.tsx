import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BattleTop: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="battleScreenTop">
      <img className="topBackIcon" src="/img/back_line.png" alt="back" />
      <button onClick={() => navigate('/main')} className="battleScreenTopButton">
        Surrender
      </button>
    </div>
  );
};
