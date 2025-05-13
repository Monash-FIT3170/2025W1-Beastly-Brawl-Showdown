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
        {/* HOSTING Routes */}
        <Route path="/host/:name" element={<HostRoomPage />} />
        <Route path="/h/:id/:name" element={<Room />} />


        {/* JOINING Routes */}
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/join/:roomCode" element={<GuestNamePage />} />
        <Route path="/guest-name" element={<GuestNamePage />} />

        {/* ROOM VIEW */}
        <Route path="/room/:id/:name" element={<Room />} />

        {/*  */}
        <Route path="/:id" element={<Player />} />
        <Route path="/homePage" element={<HomePage />} />

        {/* DEFAULTS */}
        <Route path="/" element={<LoginPage/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
);
