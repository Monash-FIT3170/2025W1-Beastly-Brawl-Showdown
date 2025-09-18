import { createContext } from "react";
import type { Socket } from "socket.io-client";
import { ServerToPlayerEvents, PlayerToServerEvents } from "../../../api/src/api";

type SocketContextType = {
  // socket: Socket | null;
  socket: Socket<ServerToPlayerEvents, PlayerToServerEvents> | null;
  setSocket: (value: Socket) => void;
};

export const SocketContext = createContext<SocketContextType | null>(null);
