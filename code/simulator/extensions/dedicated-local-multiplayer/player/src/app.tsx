import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SocketProvider } from "./socket/socket_provider";
import PlayerConnectionPage from "./pages/player_connection_page";
import GamePage from "./pages/game_page";

const App: React.FC = () => (
  <SocketProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<PlayerConnectionPage />} />
        <Route path="/" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </SocketProvider>
);

export default App;