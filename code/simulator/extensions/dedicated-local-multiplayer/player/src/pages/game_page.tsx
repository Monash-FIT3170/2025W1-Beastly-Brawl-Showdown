import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../socket/socket_context";
import BattleControls from "../components/battle_controls";
import type { Notice } from "@sim/core/notice/notice";
import { useRef } from "react";
import type { SideId } from "@sim/core/side";
import type { SelfTargeting, SingleEnemyTargeting, TargetingData } from "@sim/core/action/targeting";
import { commonMovePool } from "@sim/data/common/common_move_pool";
import type { OrderedEvent } from "@sim/core/event/event_history";

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const [showRedirectToLogin, setShowRedirectToLogin] = useState(false);
  const socketContext = useContext(SocketContext);

  const [selfInfo, setSelfInfo] = useState<SideId | null>(null);
  const [turnHistory, setTurnHistory] = useState<OrderedEvent[] | null>(null);
  const [pendingNotices, setPendngNotices] = useState<Notice[] | null>(null);


  const hasListeners = useRef(false);

  const connectProcedure = async () => {
    if (hasListeners.current) {
      return; /// Socket connection already exists - dont need this
    }

    if (!socketContext) {
      console.error("This component requiries a parent SocketContext");
      return;
    }

    if (!socketContext.socket) {
      console.error("This no socket on record, get one from join first.");
      setShowRedirectToLogin(true);

      const timer = setTimeout(() => {
        navigate("/join");
      }, 5000);

      return () => clearTimeout(timer);
    }

    socketContext.socket.onAny((event, args) => console.log(`Message recieved:\n${event}\n${JSON.stringify(args)}`));

    /// Request game data
    setSelfInfo(await socketContext.socket.emitWithAck("getSelfInfo"));
    if (!selfInfo) {
      console.error("Did not recieve SelfInfo");
      return;
    }
    setTurnHistory(await socketContext.socket.emitWithAck("getHistory"));
    if (!turnHistory) {
      console.error("Did not recieve TurnHistory");
      return;
    }
    setPendngNotices(await socketContext.socket.emitWithAck("getNotices"));
    if (!pendingNotices) {
      console.error("Did not recieve PendingNotices");
      return;
    }

    // TODO block / display loading until all data recieved

    socketContext.socket.on("newEvent", (event: OrderedEvent) => {
      console.log(`New event recorded: ${JSON.stringify(event)}`);
      setTurnHistory((prev) => [...prev!, event]);
    });
    socketContext.socket.on("newNotice", (notice: Notice) => {
      console.log(`New notice recieved: ${JSON.stringify(notice)}`);
      setPendngNotices((prev) => [...prev!, notice]);
      console.log(`Queued notice (length=${pendingNotices.length}): ${JSON.stringify(notice)}`);
    });

    return () => {
      if (!socketContext.socket) {
        return;
      }

      socketContext.socket.off("newEvent");
      socketContext.socket.off("newNotice");
      socketContext.socket.offAny();
    };
  };

  useEffect(() => {
    connectProcedure();
  }, [socketContext, navigate]);

  if (!socketContext) {
    return (
      <>
        <p>Error: Expected a socket context</p>
      </>
    );
  }

  if (showRedirectToLogin) {
    return <p>Not connected to a server. Redirecting...</p>;
  }

  function actionPanel() {
    if (!pendingNotices || pendingNotices.length == 0) {
      return <p>No pending action</p>;
    }

    const currentNotice = pendingNotices[0];
    switch (currentNotice.kind) {
      case "chooseMove": {
        return (
          <>
            <BattleControls
              onSelectedMoveId={(moveId) => {
                console.log(`Action pressed: ${moveId}`);
                let targeting: TargetingData;
                switch (commonMovePool[moveId].targetingMethod) {
                  case "self": {
                    const selfTargeting: SelfTargeting = {
                      targetingMethod: "self",
                    };
                    targeting = selfTargeting;
                    break;
                  }
                  case "single-enemy": {
                    const singleEnemyTargeting: SingleEnemyTargeting = {
                      targetingMethod: "single-enemy",
                      target: ((selfInfo! + 1) % 2) as SideId, // TODO get side id
                    };
                    targeting = singleEnemyTargeting;
                    break;
                  }

                  default:
                    console.error(`Error: Unknown targeting method: ${commonMovePool[moveId].targetingMethod}`);
                    return;
                }
                const params: Parameters<typeof currentNotice.callback> = [moveId, targeting];
                socketContext?.socket?.emit("resolveNotice", currentNotice.kind, params);

                pendingNotices.pop();
              }}
              chooseMove={currentNotice}
            />
          </>
        );
      }
      case "roll": {
        return (
          <>
            <div
              style={{
                backgroundColor: "RosyBrown",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={"src/assets/rolling-dice-cup.svg"}
                onClick={() => {
                  console.log("Roll triggered.");
                  const params: Parameters<typeof currentNotice.callback> = [];
                  socketContext?.socket?.emit("resolveNotice", currentNotice.kind, params);

                  pendingNotices.pop();
                }}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />
            </div>
          </>
        );
      }
      case "rerollOption": {
        return <button>Reroll</button>;
      }
      default:
        return <p>ERROR - unexpected value</p>;
    }
  }

  return (
    <>
      <h1>WIP - GAME</h1>
      <div>
        {/* <BattleVisualizer /> */}
        <textarea disabled value={JSON.stringify(turnHistory)} />
        <br />
        {actionPanel()}
      </div>
    </>
  );
};

export default GamePage;
