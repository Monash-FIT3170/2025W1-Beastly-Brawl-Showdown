import React from "react";
import { useNavigate } from "react-router-dom";
import { SelectMode } from "./SelectMode";

export const HomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = React.useState(false);

  const handleGuestHostName = () => {
    navigate(`/host/`);
  };

  //todo for the other type
  const handleType2 = () => {
    navigate("");
  };

  return (
    <div className="canvas-body" id="homepage">
      <div className="homepage-container">
        <div className="logo"></div>
        <div className="buttons-container">
          <button className="glb-btn" onClick={() => setShowModal(true)}>
            HOST
          </button>
          <button className="glb-btn " onClick={() => navigate("/join")}>
            JOIN
          </button>
        </div>
      </div>

      <SelectMode
        open={showModal}
        onClose={() => setShowModal(false)}
        onType1={() => {
          setShowModal(false);
          handleGuestHostName();
        }}
        //todo for the other mode
        onType2={() => {
          setShowModal(false);
          handleType2();
        }}
      />
    </div>
  );
};
