import { Navigate, Route } from "react-router-dom";
import { NotFound } from "./error/NotFound";
import { HomePage } from "./HomePage";
import WaitingRoom from "./host/projector/WaitingRoom";
import { HostRoomPage } from "./host/request-room/HostRoomPage";
import { Player } from "./player/game/PlayerPage";
import JoinPage from "./player/join-room/JoinPage";

export const renderRoutes = () => (
  <>
    {/* Home */}
    <Route path="/home/" element={<HomePage />} />

    {/* Host */}
    <Route path="/host/" element={<HostRoomPage />} />
    <Route path="/room/" element={<WaitingRoom />} />

    {/* Player */}
    <Route path="/join/:joinCode" element={<JoinPage />} />
    <Route path="/join/" element={<JoinPage />} />
    <Route path="/play/" element={<Player />} />

    {/* DEFAULTS */}
    <Route path="/" element={<Navigate to="/home/" replace />} />
    <Route path="*" element={<NotFound />} />
  </>
);
