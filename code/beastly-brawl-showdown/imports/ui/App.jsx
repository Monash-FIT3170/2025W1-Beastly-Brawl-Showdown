// import React from 'react';
// import { WaitingRoom } from './WaitingRoom';

// export const App = () => (
//   <div className='screen'>
//     <WaitingRoom />
//   </div>
// )

import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import JoinPage from "./JoinPage";
import NamePage from "./NamePage";
import { WaitingRoom } from "./WaitingRoom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host" element={<WaitingRoom />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/name" element={<NamePage />} />
    </Routes>
  );
}
