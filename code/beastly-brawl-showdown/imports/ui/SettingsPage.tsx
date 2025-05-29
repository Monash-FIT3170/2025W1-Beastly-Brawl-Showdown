import React from "react";
import { Dispatch, SetStateAction, MutableRefObject, useState, useEffect } from "react";
// From chat since idk what they were ^
import { useNavigate } from "react-router-dom";

export default function SettingsPage({
  bgmEnabled,
  setBgmEnabled,
  bgmVolume,
  setBgmVolume,
  audioRef,
}: {
  bgmEnabled: boolean;
  setBgmEnabled: Dispatch<SetStateAction<boolean>>;
  bgmVolume: number;
  setBgmVolume: Dispatch<SetStateAction<number>>;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
}
) {
  const navigate = useNavigate();
  const [tempEnabled, setTempEnabled] = useState(bgmEnabled);
  const [tempVolume, setTempVolume] = useState(bgmVolume);

  useEffect(() => {
    setTempEnabled(bgmEnabled);
    setTempVolume(bgmVolume);
  }, [bgmEnabled, bgmVolume]);

  // Live preview using global BGM audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = tempVolume / 100;

    if (tempEnabled) {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [tempEnabled, tempVolume, audioRef]);

  const handleConfirm = () => {
    setBgmEnabled(tempEnabled);
    setBgmVolume(tempVolume);
    navigate("/home");
  };

  const handleCancel = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = bgmVolume / 100;
      bgmEnabled ? audio.play().catch(() => {}) : audio.pause();
    }
    navigate("/home");
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="bgm-toggle-container">
        <label>BGM</label>
        <div className="toggle-switch">
          <button
            className={tempEnabled ? "toggle-btn on" : "toggle-btn"}
            onClick={() => setTempEnabled(true)}
          >
            On
          </button>
          <button
            className={!tempEnabled ? "toggle-btn off" : "toggle-btn"}
            onClick={() => setTempEnabled(false)}
          >
            Off
          </button>
        </div>
      </div>

      <div className="volume-control">
        <label htmlFor="bgmVolume">BGM Volume</label>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            id="bgmVolume"
            type="range"
            min="0"
            max="100"
            value={tempVolume}
            onChange={(e) => setTempVolume(Number(e.target.value))}
            disabled={!tempEnabled}
          />
          <span>{tempVolume}%</span>
        </div>
      </div>

      <div className="settings-buttons">
        <button className="btn glb-btn" onClick={handleConfirm}>
          ✔️ Confirm
        </button>
        <button className="btn glb-btn" onClick={handleCancel}>
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}
