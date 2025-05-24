import { Meteor } from "meteor/meteor";
import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { DDP } from "meteor/ddp";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";

export default function WaitingRoom() {
  const joinCode = sessionStorage.getItem("joinCode");
  const joinUrl = Meteor.absoluteUrl() + "join/" + joinCode;

  const serverUrl = sessionStorage.getItem("serverUrl");
  if (!serverUrl) {
    throw new Error("No server url provided.");
  }

  // Connect to game server
  const gameServerConnection = DDP.connect(serverUrl);
  // Subscribe to events
  gameServerConnection.subscribe("lobby.players.onAddPlayer");
  gameServerConnection.subscribe("lobby.players.onRemovePlayer");

  return (
    <div className="waiting-room-box">
      <h1>Game Lobby</h1>
      <h2>Room ID: {joinCode}</h2>
      <WaitingRoomInfoBox joinUrl={joinUrl} />
      <ParticipantDisplayBox name={"PLACEHOLDER - WIP"} />
    </div>
  );
}
