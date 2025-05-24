import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import { GameStates } from "../api/GameStates";

export default function WaitingRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const playerName = sessionStorage.getItem("guestName");
  if (!playerName) throw new Error("Player name is not set in sessionStorage.");

  const [revealURL, setURL] = useState("");

  // Subscribe to game state for this room
  useTracker(() => {
    if (id) {
      return Meteor.subscribe("gameStatesByRoom", id);
    }
  }, [id]);

  // Reactively track game state for this room
  const gameState = useTracker(() => {
    return GameStates.findOne({ roomId: id }) || {};
  }, [id]);

  // Log gameState to console whenever it changes
  useEffect(() => {
    console.log("Current gameState:", gameState);
  }, [gameState]);

  // Build join URL on mount
  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setURL(joinURL);
    }
  }, [id]);

  // Initialize default game state phase on mount
  useEffect(() => {
    if (id) {
      Meteor.call("gameStates.initialize", id, (error: any) => {
        if (error) {
          console.error("Failed to initialize game state:", error);
        } else {
          console.log("Game state initialized to default waiting phase");
        }
      });
    }
  }, [id]);

  // Navigate to Monster Selection screen when phase changes
  useEffect(() => {
    if (gameState.phase === "monsterSelection" && id) {
      navigate(`/monster-selection/${id}`);
    }
  }, [gameState.phase, id, navigate]);

  return (
    <div className="waiting-room-box">
      <h1>Room ID: {id}</h1>
      <h2>Waiting Room</h2>
      <WaitingRoomInfoBox joinURL={revealURL} />
      <ParticipantDisplayBox name={playerName} />
    </div>
  );
}
