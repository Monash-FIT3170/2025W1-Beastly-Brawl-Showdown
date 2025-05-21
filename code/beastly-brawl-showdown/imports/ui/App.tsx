import React, { useRef, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import JoinPage from "./JoinPage";
import NamePage from "./NamePage";
import WaitingRoom from "./WaitingRoom";
import SettingsPage from "./SettingsPage";
import MonsterPage from "./MonsterPage";
import { LoginPage } from "./Login/LoginPage";
import { GuestNamePage } from "./GuestNamePage";
import { HostRoomPage } from "./Room/HostRoomPage";

export default function App() {
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(50);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = bgmVolume / 100;
      bgmEnabled ? audioRef.current.play() : audioRef.current.pause();
    }
  }, [bgmEnabled, bgmVolume]);

  return (
    <>
      <audio ref={audioRef} src="/sounds/background-music.mp3" loop />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/name" element={<NamePage />} />
        <Route path="/host" element={<WaitingRoom />} />
        <Route path="/guest-name" element={<GuestNamePage />} />
        <Route path="/host/:name" element={<HostRoomPage />} />
        <Route path="/join/:roomCode" element={<GuestNamePage />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              bgmEnabled={bgmEnabled}
              setBgmEnabled={setBgmEnabled}
              bgmVolume={bgmVolume}
              setBgmVolume={setBgmVolume}
              audioRef={audioRef}
            />
          }
        />
      </Routes>
    </>
  );
}
