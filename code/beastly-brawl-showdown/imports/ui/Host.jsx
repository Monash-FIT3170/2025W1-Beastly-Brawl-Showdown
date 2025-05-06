import React from 'react'; // React is needed here for JSX
import { Meteor } from 'meteor/meteor';

export const Host = () => {
  const handleHostClick = () => {
    Meteor.call('createRoom', (error, result) => {
      if (error) {
        console.error('Error creating room:', error);
      } else {
        console.log('Room created:', result);
      }
    });
  };

  return (
    <div>
      <button onClick={handleHostClick}>Host</button>
    </div>
  );
};
