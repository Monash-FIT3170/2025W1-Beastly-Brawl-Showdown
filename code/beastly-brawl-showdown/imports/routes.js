import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound } from "./ui/Error/NotFound";
import { HomePage } from "./ui/HomePage";
import { Player } from "./ui/PlayerPage";
import { Room } from "./ui/Room/Room";
import { HostRoomPage } from "./ui/Room/HostRoomPage";
import { JoinRoomPage } from "./ui/Room/JoinRoomPage";
import { GuestNamePage } from "./ui/GuestNamePage";
import { LoginPage } from "./ui/Login/LoginPage";
export const renderRoutes = () => (
  <>
    <BrowserRouter>
      <Routes>
        <Route path="/host" element={<HostRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />

        <Route path="/join/:roomCode" element={<GuestNamePage />} />
        <Route path="/room/:id/:name" element={<Room />} />
        {/*  */}

        <Route path="/h/:id" element={<Room />} />
        <Route path="/:id" element={<Player />} />
        <Route path="/homePage" element={<HomePage />} />
        {/* DEFAULTS */}
        <Route path="/" element={<LoginPage/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);
