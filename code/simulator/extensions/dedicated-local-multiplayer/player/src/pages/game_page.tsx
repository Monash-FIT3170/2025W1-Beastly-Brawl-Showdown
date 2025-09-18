import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../socket/socket_context";
import BattleControls from "../../../../../extensions/visualiser/src/Components/battle_controls";
import type { Notice } from "../../../../../core/notice/notice";
import type { SideId } from "../../../../../core/side";
import type { SelfTargeting, SingleEnemyTargeting, TargetingData } from "../../../../../core/action/targeting";
import { COMMON_MOVE_NAMES, COMMON_MOVE_POOL } from "../../../../../data/common/common_move_pool";
import type { OrderedEvent } from "../../../../../core/event/event_history";
import { MoveId } from "../../../../../core/action/move/move_pool";
import BattleVisualiser from "../../../../visualiser/src/BattleVisualiser";
import {} from "../../../api/src/api";

/**
 * Duration for timeouts before they should be counted as dropped
 */
const ACK_TIMEOUT = 10000;

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
      }, ACK_TIMEOUT);

      return () => clearTimeout(timer);
    }

    socketContext.socket.onAny((event, args) => console.log(`Message recieved:\n${event}\n${JSON.stringify(args)}`));

    // TODO block / display loading until all data recieved

    socketContext.socket.on("newEvent", (event: OrderedEvent) => {
      console.log(`New event recorded: ${JSON.stringify(event)}`);
      if (!turnHistory) {
        setTurnHistory([event]);
      }
      else{
      setTurnHistory((prev) => [...prev!, event]);
      }
    });
    socketContext.socket.on("newNotice", (notice: Notice) => {
      console.log(`New notice recieved: ${JSON.stringify(notice)}`);
      setPendngNotices((prev) => [...(prev ?? [notice]), notice]);
      if (!pendingNotices) {
        console.error("ERR: Pending notices is still not initialised.");
        return;
      }
      console.log(`Queued notice (length=${pendingNotices.length}): ${JSON.stringify(notice)}`);
    });

    console.log("Fetching self info");
    try {
      await socketContext.socket
        .timeout(ACK_TIMEOUT)
        .emitWithAck("getSelfInfo")
        .then((fetchedSelfInfo) => {
          console.log(`Self info recieved: ${fetchedSelfInfo}`);
          if (!selfInfo) {
            console.error("Did not receive SelfInfo");
            return;
          }
          setSelfInfo(fetchedSelfInfo);
        });
    } catch (err) {
      console.error("ERR: " + err);
    }

    console.warn(`Fetching turn history`);
    try {
      await socketContext.socket
        .timeout(ACK_TIMEOUT)
        .emitWithAck("getHistory")
        .then((fetchedHistory) => {
          console.log(`History recieved: ${fetchedHistory}`);
          if (!turnHistory) {
            console.error("Did not receive TurnHistory");
            return;
          }
          setTurnHistory(fetchedHistory);
        });
    } catch (err) {
      console.error("ERR: " + err);
    }

    console.warn(`Fetching turn notices`);
    try {
      await socketContext.socket
        .timeout(ACK_TIMEOUT)
        .emitWithAck("getNotices")
        .then((notices) => {
          console.log(`Notices recieved: ${notices}`);
          if (!pendingNotices) {
            console.error("Did not receive PendingNotices");
            return;
          }
          setPendngNotices(notices);
        });
    } catch (err) {
      console.error("ERR: " + err);
    }
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
    console.log(pendingNotices);
    if (!pendingNotices || pendingNotices.length == 0) {
      return <p>No pending action</p>;
    }

    const currentNotice = pendingNotices[0];
    switch (currentNotice.kind) {
      case "chooseMove": {
        return (
          <>
            <BattleControls
              onSelectedMoveId={(moveId: MoveId) => {
                console.log(`Action pressed: ${moveId}`);
                let targeting: TargetingData;
                switch (COMMON_MOVE_POOL[moveId as COMMON_MOVE_NAMES].targetingMethod) {
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
                    console.error(`Error: Unknown targeting method: ${COMMON_MOVE_POOL[moveId as COMMON_MOVE_NAMES].targetingMethod}`);
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
      <div>
        <BattleVisualiser rawEvents={turnHistory} />
        {/* <textarea disabled value={JSON.stringify(turnHistory)} /> */}
        <br />
        {actionPanel()}
      </div>
    </>
  );
};

export default GamePage;
