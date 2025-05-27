import React from "react";
import { Route } from "react-router-dom";
import { NotFound } from "./ui/error/NotFound";
import { HomePage } from "./ui/HomePage";
import { Player } from "./ui/player/game/PlayerPage";
import { Room } from "./ui/Room/Room";
import { GuestNamePage } from "./ui/GuestNamePage";
import { LoginPage } from "./ui/Login/LoginPage";
import { MonsterSelectionScreen } from "./ui/MonsterSelection/MonsterSelectionScreen";
import JoinPage from "./ui/player/join-room/JoinPage";
import WaitingRoom from "./ui/WaitingRoom";
import { BattleScreen } from "./ui/BattleScreen/BattleScreen";

export const renderRoutes = () => (
  <>
        {/* HOSTING Routes */}
        <Route path="/h/:id/" element={<Room />} />

        {/* JOINING Routes */}
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/:roomCode" element={<GuestNamePage/>} />
        <Route path="/guest-name" element={<GuestNamePage />} />

        {/* ROOM VIEW */}
        <Route path="/room/:id/" element={<WaitingRoom />} />

        {/* MONSTER SELECTION */}
        <Route path="/monster-selection/:id" element={<MonsterSelectionScreen />} />

        {/* BATTLE PAGE */}
        <Route path="battle/:id" element = {<BattleScreen/>}/>

        {/*  */}
        <Route path="/:id" element={<Player />} />
        <Route path="/homePage" element={<HomePage />} />

        {/* DEFAULTS */}
        <Route path="/" element={<LoginPage/>} />
        <Route path="*" element={<NotFound />} />

        {/*Moved from app*/}
        <Route path="/home" element={<HomePage />} />
        <Route path="/host" element={<WaitingRoom />} />
      
    
  </>
);
