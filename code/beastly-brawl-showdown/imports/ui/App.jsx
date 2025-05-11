// import React from 'react';
// import { WaitingRoom } from './WaitingRoom';

// export const App = () => (
//   <div className='screen'>
//     <WaitingRoom />
//   </div>
// )

import React, { useRef, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import JoinPage from "./JoinPage";
import NamePage from "./NamePage";
import WaitingRoom from "./WaitingRoom";
import SettingsPage from "./SettingsPage";

export default function App() {
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(50);
  const audioRef = useRef(null);

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
        <Route path="/" element={<HomePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/name" element={<NamePage />} />
        <Route path="/host" element={<WaitingRoom />} />
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
