import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./HomePage";
import HostPage from "./HostPage";
import JoinPage from "./JoinPage";
import NamePage from "./NamePage";
import { WaitingRoom } from './WaitingRoom';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/host" element={<HostPage />} />
      <Route path="/join" element={<JoinPage />} />
      <Route path="/name" element={<NamePage />} />
    </Routes>
  );
}
