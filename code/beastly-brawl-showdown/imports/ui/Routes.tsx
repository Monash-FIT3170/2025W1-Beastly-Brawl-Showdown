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
    {/* HOST Routes */}
    <Route path="/host/" element={<HostRoomPage />} />
    <Route path="/room/" element={<WaitingRoom />} />

    {/* PLAYER Routes */}
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/join" element={<JoinPage />} />
    {/* vvvvvvvvvvvvvvvv currently unused vvvvvvvvvvvvvvvvv  */}
    {/* <Route path="/h/:id" element={<Room />} /> */}
    <Route path="/play" element={<Player />} />
    <Route path="/guest-name" element={<GuestNamePage />} />

    {/* GENERAL ROUTES */}
    <Route path="/home" element={<Navigate to="/" replace />} />

    {/* DEFAULTS */}
    <Route path="/" element={<HomePage />} />
    <Route path="*" element={<NotFound />} />
  </>
);
