import React from "react";
// import BattleVisualiser from "../../../visualiser/src/BattleVisualiser"
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GamePage from "./pages/game_page";
import PlayerConnectionPage from "./pages/player_connection_page";
import { SocketProvider } from "./socket/socket_provider";

// export default App;

const App: React.FC = () => (
  <SocketProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/join" element={<PlayerConnectionPage />} />
        <Route path="/" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </SocketProvider>
  //<BattleVisualiser />
);

export default App;
