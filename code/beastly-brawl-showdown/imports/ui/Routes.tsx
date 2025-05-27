import React from "react";
import { Navigate, Route } from "react-router-dom";
import { NotFound } from "./error/NotFound";
import { HomePage } from "./HomePage";
import ProjectorPage from "./host/projector/ProjectorPage";
import { HostRoomRequestPage } from "./host/request-room/HostRoomRequestPage";
import { Player } from "./player/game/PlayerPage";
import JoinPage from "./player/join-room/JoinPage";

export const renderRoutes = () => (
  <>
    {/* Home */}
    <Route path="/home/" element={<HomePage />} />

    {/* Host */}
    <Route path="/host/" element={<ProjectorPage />} />
    {/* <Route path="/host/" element={<HostRoomRequestPage />} /> */}
    {/* <Route path="/room/" element={<ProjectorPage />} /> */}

    {/* Player */}
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/join/" element={<JoinPage />} />
    <Route path="/play/" element={<Player />} />

    {/* DEFAULTS */}
    <Route path="/" element={<Navigate to="/home/" replace />} />
    <Route path="*" element={<NotFound />} />
  </>
);
