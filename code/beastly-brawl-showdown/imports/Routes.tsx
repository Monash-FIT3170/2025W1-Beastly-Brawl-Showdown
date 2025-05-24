import React from "react";
import { Route } from "react-router-dom";
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
    
      
        {/* HOSTING Routes */}
        <Route path="/host/" element={<HostRoomPage />} />
        <Route path="/h/:id/" element={<Room />} />


        {/* JOINING Routes */}
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/:roomCode" element={<GuestNamePage/>} />
        <Route path="/guest-name" element={<GuestNamePage />} />

        {/* ROOM VIEW */}
        <Route path="/room/:id/" element={<WaitingRoom />} />

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
