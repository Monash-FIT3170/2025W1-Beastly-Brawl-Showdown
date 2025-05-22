import React from 'react';
import { Hello } from './Hello';
import { Info } from './Info';

export const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <Hello />
    <Info />
    <p>NOTICE WIP: This will be the admin panel for this server instance</p>
  </div>
);
