import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlayerConnectionPage from "./pages/player_connection_page";
import GamePage from "./pages/game_page"; // an example other page
import { SocketProvider } from "./socket/socket_provider";
import BattleVisualiser from "../../../visualiser/BattleVisualiser"

// export default App;

const App: React.FC = () => (
  <BattleVisualiser />
);

export default App;
