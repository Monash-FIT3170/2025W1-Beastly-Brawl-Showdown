import { WaitingRoomInfoBox } from "./WaitingRoomInfoBox";
import { ParticipantDisplayBox } from "./ParticipantDisplayBox";
import { io, Socket } from "socket.io-client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import { getBestServerUrl } from "../../../utils/RoomMethods";
import type {
  HostClientToServerEvents,
  HostServerToClientEvents,
} from "../../../../../shared/types";

type HostSocket = Socket<HostServerToClientEvents, HostClientToServerEvents>;

export default function ProjectorPage() {
  const [serverUrl, setServerUrl] = useState<string>();
  const [roomId, setRoomId] = useState<number>();
  const [joinCode, setJoinCode] = useState<string>("");

  const [playerList, setPlayerList] = useState<string[]>([]);
  const socketRef = useRef<HostSocket | null>(null);

  const { type } = useParams<{ type: "standard" | "random" }>();
  const tournamentType = type === "random" ? "random" : "standard";
  
  function getJoinUrl() {
    return window.location.hostname + "join/" + joinCode;
  }

  const fetchServerUrl = async () => {
    if (!serverUrl) {
      try {
        const res = await getBestServerUrl();
        setServerUrl(res);
        console.log("Server found at:", res);
      } catch (err) {
        console.error("Error locating server:", err);
      }
    }
  };

  useEffect(() => {
    fetchServerUrl(); // Run once to fetch and set serverUrl
  }, []);

  useEffect(() => {
    if (!serverUrl || socketRef.current) return;

    const cleanServerUrl = serverUrl.replace(/^"|"$/g, "");

    const wsUrl = cleanServerUrl.replace(/^http/, "wss") + "/host";
    socketRef.current = io(wsUrl, { transports: ["websocket", "polling"] });


    // Connect to game server
    console.log(serverUrl);
    // socketRef.current = io(serverUrl + "/host");


    socketRef.current.on("connect", () => {
      if (!socketRef.current) {
        console.error("No socket open.");
        return;
      }
      console.log("Connected to server");
      socketRef.current?.emit("requestRoom", { type: tournamentType });
      });

    socketRef.current.on("connect_error", (err: Error) => {
      console.error(`Connection failed: ${err.message}`);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socketRef.current.on("echo", (msg: string) => {
      console.log(`Server says: ${msg}`);
    });
    //#endregion

    //#region Request Room
    socketRef.current.on("requestRoomResponse", (roomInfo: { roomId: number; joinCode: string }) => {
      console.log("Room request response", roomInfo);
      setRoomId(roomInfo.roomId);
      setJoinCode(roomInfo.joinCode);
    });

    //#region Host App events
    socketRef.current.on("refreshPlayerList", (newPlayerList: string[]) => {
      console.log("New set of players:", newPlayerList.toString());
      setPlayerList(newPlayerList);
    });

    // if (!roomId) {
    //   socketRef.current.emit("requestRoom", {type: tournamentType});
    //   return;
    // }
    //#endregion

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, [serverUrl, type]);
  //#endregion

  //#region Host App

  function handleStartGame() {
    if (socketRef.current) {
      socketRef.current.emit("requestStartGame", { roomId, type: tournamentType });
      console.log("Start game requested!", tournamentType);
    }
  }

  if (!serverUrl || !roomId) return <p>Connecting / Starting room...</p>;

  return (
    <div className="canvas-body" id="waiting-room-body">
      <div className="waiting-room-header">
        <div className="join-info">
          Join the game with your phone!
          <br />
          Scan the QR code or join with the code!
        </div>
        <WaitingRoomInfoBox joinCode={joinCode} joinUrl={getJoinUrl()} />
      </div>

      <div className="waiting-room-logo">
        <h1>Beastly Brawl Showdown!</h1>
      </div>

      <ParticipantDisplayBox name={playerList.toString()} />

      <button className="glb-btn" id="start-game-btn" onClick={handleStartGame}>
        Start Game
      </button>
    </div>
  );
  //#endregion
}
