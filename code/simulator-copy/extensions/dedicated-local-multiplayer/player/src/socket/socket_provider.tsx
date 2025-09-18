import React, { useState } from "react";
import type { Socket } from "socket.io-client";
import { SocketContext } from "./socket_context";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  return <SocketContext.Provider value={{ socket, setSocket }}>{children}</SocketContext.Provider>;
}
