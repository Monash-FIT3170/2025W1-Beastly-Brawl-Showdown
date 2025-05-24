import React from "react";
import { Navigate, Route } from "react-router-dom";
import { NotFound } from "./Error/NotFound";
import { HomePage } from "./HomePage";
import { Player } from "./PlayerPage";
import { Room } from "./Room/Room";
import { HostRoomPage } from "./Room/HostRoomPage";
import { GuestNamePage } from "./GuestNamePage";
import { LoginPage } from "./Login/LoginPage";
import JoinPage from "./JoinPage";
import WaitingRoom from "./WaitingRoom";

export const renderRoutes = () => (
  <>
    {/* Home */}
    <Route path="/home/" element={<HomePage />} />
    
    {/* Host */}
    <Route path="/host/" element={<HostRoomPage />} />
    <Route path="/room/" element={<WaitingRoom />} />

    {/* Player */}
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/join" element={<JoinPage />} />
    <Route path="/play" element={<Player />} />

    {/* DEFAULTS */}
    <Route path="/" element={<Navigate to="/home/" replace />} />
    <Route path="*" element={<NotFound />} />
  </>
);
