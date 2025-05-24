import React from "react";
import { Route } from "react-router-dom";
import { NotFound } from "./Error/NotFound";
import { HomePage } from "./HomePage";
import { PlayerPage } from "./PlayerPage";
import { Room } from "./Room";
import { HostRoomRequestPage } from "./host/HostRoomRequestPage";
import { GuestNamePage } from "./GuestNamePage";
import { LoginPage } from "./Login/LoginPage";
import JoinPage from "./player/JoinPage";
import ProjectorPage from "./host/ProjectorPage";

export const renderRoutes = () => (
  <>
    {/* HOST */}
    <Route path="/host/" element={<HostRoomRequestPage />} />
    <Route path="/room/" element={<ProjectorPage />} />

    {/* PLAYER */}
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/join/" element={<JoinPage />} />
    <Route path="/play/" element={<PlayerPage />} />

    {/* HOME */}
    <Route path="/home" element={<HomePage />} />
    <Route path="/" element={<HomePage />} />

    {/* DEFAULTS */}
    <Route path="*" element={<NotFound />} />
  </>
);
