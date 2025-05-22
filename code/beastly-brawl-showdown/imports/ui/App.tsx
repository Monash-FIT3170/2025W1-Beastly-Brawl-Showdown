import React, { useRef, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { renderRoutes } from "../Routes";
import SettingsPage from "./SettingsPage";


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
        {/* All main app routes */}
        {renderRoutes()}
      </Routes>
    </>
  );
}
