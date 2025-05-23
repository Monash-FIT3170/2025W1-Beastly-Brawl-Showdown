import React from 'react';

export const ParticipantBox = ({ name }: { name: string }) => {
  return (
    <div className="participants-box">
      {name}
    </div>
  );
};
