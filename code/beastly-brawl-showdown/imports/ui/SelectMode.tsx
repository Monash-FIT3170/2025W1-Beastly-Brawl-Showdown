import React from "react";

interface SelectModeProps {
  open: boolean;
  onClose: () => void;
  onType1: () => void;
  onType2: () => void;
}

export const SelectMode: React.FC<SelectModeProps> = ({
  open,
  onClose,
  onType1: standard,
  onType2: random,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Select Game Mode</h2>
        <button className="glb-btn" onClick={standard}>
          Standard
        </button>
        <button className="glb-btn" onClick={random}>
          Random
        </button>
        <button className="glb-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};
