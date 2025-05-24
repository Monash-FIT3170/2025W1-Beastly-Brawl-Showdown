import React from "react";
import { Navigate, Route } from "react-router-dom";
import { NotFound } from "./ui/Error/NotFound";
import { HomePage } from "./ui/HomePage";
import { Player } from "./ui/PlayerPage";
import { Room } from "./ui/Room/Room";
import { HostRoomPage } from "./ui/Room/HostRoomPage";
import { GuestNamePage } from "./ui/GuestNamePage";
import { LoginPage } from "./ui/Login/LoginPage";
import JoinPage from "./ui/JoinPage";
import WaitingRoom from "./ui/WaitingRoom";

export const renderRoutes = () => (
  <>
    {/* HOST Routes */}
    <Route path="/host/" element={<HostRoomPage />} />
    <Route path="/h/:id/" element={<Room />} />
    <Route path="/room/:id/" element={<WaitingRoom />} />

    {/* PLAYER Routes */}
    <Route path="/join" element={<JoinPage />} />
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/play" element={<Player />} />
    <Route path="/guest-name" element={<GuestNamePage />} />


    {/* GENERAL ROUTES */}
    <Route path="/home" element={<Navigate to="/" replace />} />

    {/* DEFAULTS */}
    <Route path="/" element={<HomePage />} />
    <Route path="*" element={<NotFound />} />
  </>
);
