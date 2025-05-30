import React, { createContext, useContext, useEffect, useRef, useState, } from "react";
import { io, Socket } from "socket.io-client";
import { MonsterSelectionScreen } from "../../MonsterSelection/MonsterSelectionScreen";
import { BattleScreen } from "../../BattleScreen/BattleScreen";
import { monsterData, MonsterName } from "/imports/data/monsters/MonsterData";
import Monsters from "/imports/data/monsters/Monsters";

//#region Socket Context Definition

// Typing the context and socket for typescript
interface PlayerSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Creates persistent instance of the socket connection
const PlayerSocketContext = createContext<PlayerSocketContextType>({
  socket: null,
  isConnected: false,
});

/**
 * Wrapper class to allow the socket to be passed to other components
 * @param children Name of react component (screen) that needs to access the socket connection
 * @returns Blueprint to allow child component to access the socket
 */
const PlayerSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Has the player established connection through the socket
  const [isConnected, setIsConnected] = useState(false);

  // Connection to the socket
  const socketRef = useRef<Socket | null>(null);

  // Variables accessed through session storage
  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  useEffect(() => {
    if (!socketRef.current) {
      // Establish connection to the server through channel defined in main.ts
      socketRef.current = io(serverUrl + "/player", {
        auth: { joinCode, displayName },
      });

      // Establish connection handshake to server
      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });
      
      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Connection failed:", err.message);
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [serverUrl, joinCode, displayName]);

  // Blueprint that allows component wrapped in this class to access the player's socket connection
  return (
    <PlayerSocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </PlayerSocketContext.Provider>
  );
};

// Export context containing the socket connection to be accessible in other react components
export const usePlayerSocket = () => useContext(PlayerSocketContext);
//#endregion

//#region Main Player Component
const PlayerContent = () => {
  // Socket established using the exported context function
  const { socket, isConnected } = usePlayerSocket();

  // Session storage variables initialised for this component
  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  // State triggers to change screens and perform actions
  const [startSelection, setStartSelection] = useState(false);
  const [monsterSelected, setMonsterSelected] = useState(false);
  const [allReady, setReady] = useState(false);

  useEffect(() => {
    if (!socket) return;
    // Listen for game start
    socket.on("game-started", () => {
      setStartSelection(true);
    });

    // Listen for round-start
    socket.on("round-start", () => {
      console.log(`Round start command received from server`)
      setReady(true);
    })

    return () => {
      socket.off("game-started");
    };
  }, [socket]);

  // Screen that displays when player is connecting to server
  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

  // Once connected, this screen will display
  if (!startSelection) {
    return (
      <div>
        <h1>PLAYER VIEW</h1>
        <p>Server URL: {serverUrl}</p>
        <p>Name: {displayName}</p>
        <p>Room Code: {joinCode}</p>
      </div>
    );
  }

  // Type checking function converting string to MonsterName union
  function isMonsterName(name: string): name is MonsterName {
    return name in monsterData;
  }

  // Function that takes the result of monster selection and sends it to the server, then switches screen.
  const handleMonsterSelection = (monster: string) => {
    // Checking if string is valid monster
    if (isMonsterName(monster)) {
      // Create new monster based on string given
      const data: Monsters = new monsterData[monster]();

      // Check if socket exists
      if (socket) {
        console.log(data);
        socket.emit("RequestSubmitMonster", { data });

        // TODO: Make sure all players select a monster before changing the state below
        setMonsterSelected(true);
        console.log("Monster selected:", monster);
      } else {
        console.log(`No socket connection available: socket ${socket}`);
      }
    } else {
      console.log(`Invalid monster name: ${monster}`);
    }
  };

  // Monster selection is displayed when a monster has not been selected
  if (!monsterSelected) {
    return (
      <MonsterSelectionScreen
        setSelectedMonsterCallback={handleMonsterSelection}
      />
    );
  }

  // Waiting screen while players select monsters
  if (!allReady) {
    return <p>Waiting for all players to select their monsters...</p>;
  }

  // Battle screen displays when all checks have been passed
  // TODO: selectedMonsterName should not exist, battle screen needs some other way to know what monsters to display
  return <BattleScreen />;
};
//#endregion

//#region Exported Component
// Wrap the contents of the page to allow original player content to access the socket
export const Player = () => (
  <PlayerSocketProvider>
    <PlayerContent />
  </PlayerSocketProvider>
);
//#endregion

