import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound } from "./ui/Error/NotFound";
import { Home } from "./ui/Home";
import { Player } from "./ui/Player";
import { Room } from "./ui/Room/Room";
import { HostRoom } from "./ui/Room/HostRoom";
import { JoinRoom } from "./ui/Room/JoinRoom";

export const renderRoutes = () => (
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/host" element={<HostRoom />} />
        <Route path="/join" element={<JoinRoom />} />
        {/*  */}
        <Route path="/h/:id" element={<Room />} />
        <Route path="/:id" element={<Player />} />
        {/* DEFAULTS */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);
