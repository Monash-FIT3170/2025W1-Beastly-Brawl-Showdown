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

  const [revealURL, setRevealURL] = useState("");

  // Subscribe and track readiness
  const subscriptionReady = useTracker(() => {
    if (id) {
      console.log(`[Client] Subscribing to gameStatesByRoom for roomId: ${id}`);
      const handle = Meteor.subscribe("gameStatesByRoom", id);
      return handle.ready();
    }
    return false;
  }, [id]);

  // Fetch gameState reactively when subscription is ready
  const gameState = useTracker(() => {
    if (!subscriptionReady || !id) return null;
    const gs = GameStates.findOne({ roomId: id }) || null;
    console.log(`[Client] Fetched gameState for room ${id}:`, gs);
    return gs;
  }, [id, subscriptionReady]);

  // Build join URL on mount / id change
  useEffect(() => {
    if (id) {
      const joinURL = Meteor.absoluteUrl(`/join/${id}`);
      setRevealURL(joinURL);
      console.log(`[Client] Join URL set to: ${joinURL}`);
    }
  }, [id]);

  // Initialize phase to 'waiting' when component mounts or id changes
  useEffect(() => {
    if (id) {
      console.log(`[Client] Calling initialize for room: ${id}`);
      Meteor.call("gameStates.initialize", id, (error: any) => {
        if (error) {
          console.error(`[Client] Initialize failed for room ${id}:`, error);
        } else {
          console.log(`[Client] Initialize succeeded for room ${id}`);
        }
      });
    }
  }, [id]);

  // React to phase changes: navigate when phase hits "monsterSelection"
  useEffect(() => {
    if (gameState) {
      console.log(`[Client] Phase changed for room ${id}:`, gameState.phase);
      if (gameState.phase === "monsterSelection" && id) {
        console.log(`[Client] Navigating to monster selection screen for room: ${id}`);
        navigate(`/monster-selection/${id}`);
      }
    }
  }, [gameState, id, navigate]);

  if (!subscriptionReady) {
    return <div>Loading game state...</div>;
  }

  return (
    <div className="waiting-room-box">
      <h1>Room ID: {id}</h1>
      <h2>Waiting Room</h2>
      <WaitingRoomInfoBox joinURL={revealURL} />
      <ParticipantDisplayBox name={playerName} />
    </div>
  );
}
