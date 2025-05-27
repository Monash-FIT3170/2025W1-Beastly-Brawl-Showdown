import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import Monster from "/imports/data/monsters/Monsters";
import { allMonsters } from "/imports/data/monsters/MonsterData";
import { useNavigate } from "react-router-dom";
import { BattleMonster } from "../../BattleScreen/BattleMonster";

export const Player = () => {
  const navigate = useNavigate();

  const joinCode = sessionStorage.getItem("joinCode");
  const displayName = sessionStorage.getItem("displayName");
  const serverUrl = sessionStorage.getItem("serverUrl");

  // const [selectedMonsterType, setSelectedMonsterType] =
  //   useState<typeof Monster>();
  const [lockedSelectedMonster, setLockedSelectedMonster] = useState(false);
  const [myMonster, setMyMonsterMonster] = useState<Monster>();
  const [enemyMonster, setenemyMonsterMonster] = useState<Monster>();
  const [hasSelfSumbittedTurn, setHasSelfSumbittedTurn] = useState(false);


  //#region Connect to game server
  const socketRef = useRef<Socket>();
  useEffect(() => {
    socketRef.current = io(serverUrl + "/player", {
      auth: {
        joinCode: joinCode,
        displayName: displayName,
      },
    });
    console.log("Connecting to server with auth...");

    socketRef.current.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
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

    // Listens for game-started trigger from
    socketRef.current.on("game-started", () => {
      setMonsterSelection(true);
    });

    socketRef.current.on(
      "turn-result",
      (myMonsterNewState, enemyMonsterNewState) => {
        // TODO update self state
        console.log(
          "current\nmymonster\n",
          myMonster,
          "enemymonn\n",
          enemyMonster
        );
        console.log(
          "updated\nmymonster\n",
          myMonsterNewState,
          "enemymonn\n",
          enemyMonsterNewState
        );

        // TODO trigger play out turn
        // TODO then reset to be ready for next turn
        setHasSelfSumbittedTurn(false);
      }
    );

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Cleanup on unmount
      }
    };
  }, []);
  //#endregion

  const [isConnected, setIsConnected] = useState(false);
  const [isSelection, setMonsterSelection] = useState(false);

  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [displayedNumber, setDisplayedNumber] = useState<number | null>(null); // TODO TEMP

  useEffect(() => {
    // Apply body display override only if not connected AND not in monster selection
    if (isConnected && lockedSelectedMonster) {
      document.body.style.display = "block"; // or whatever you want here
      document.body.style.paddingTop = "0";
    }

    // Cleanup on unmount or dependency change
    return () => {
      document.body.style.display = "flex"; // reset to default
      document.body.style.paddingTop = "10";
    };
  }, [isConnected, isSelection]);

  
  //if the showwanimation is true then show thtet animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (showAnimation) {
      let i = 0;
      const rollDuration = 1000; // total roll duration in ms
      const intervalSpeed = 100; // time between number updates

      const finalResult = 20; // eventually will replace with dice roll utility
      const totalSteps = rollDuration / intervalSpeed; //get the ammount of times it gets swaped out

      interval = setInterval(() => {
        if (i < totalSteps) {
          setDisplayedNumber(Math.floor(Math.random() * 20) + 1); // roll 1-20
          i++;
        } else {
          clearInterval(interval);
          setDisplayedNumber(finalResult);

          timeout = setTimeout(() => {
            console.log("Final result displayed for 3 seconds");
          }, 3000);
        }
      }, intervalSpeed);
    }

    // Clean up interval and timeout
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showAnimation]);

  
  // Function to trigger the rolling animation
  const onSelectActionAttack = (): void => {
    // if (!socketRef.current) {
    //   throw new Error("No connection to server exists.");
    // }

    // socketRef.current.emit("submit-move-attack", myMonster); // TODO TEMP

    // setHasSelfSumbittedTurn(true); // TODO CHANGE RENDER STATE TO WAIT FOR ENEMY SUBMISSION
    if (!showAnimation) {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);
    }
  };

  if (!isConnected) {
    return <p>Connecting to server...</p>;
  }

  if (!isSelection) {
    return (
      <div>
        <h1>PLAYER VIEW</h1>
        <p>Server URL: {serverUrl}</p>
        <p>Name: {displayName}</p>
        <p>Room Code: {joinCode}</p>
      </div>
    );
  }

  //#region Select Monster Phase
  if (!lockedSelectedMonster || !myMonster) {
    return (
      <>
        <div className="monsterSelectionScreen">
          <h1>Choose your Monster:</h1>
          {allMonsters.map((monster) => {
            return (
              <div className="monsterContainer">
                <img
                  src={monster.imageSelection}
                  id={monster.type}
                  key={monster.type}
                  className="monsterImage"
                  onClick={() => {
                    setMyMonsterMonster(monster);
                  }}
                />
              </div>
            );
          })}

          {myMonster && (
            <button
              id="confirmMonsterButton"
              onClick={() => setLockedSelectedMonster(true)}
              disabled={lockedSelectedMonster}
            >
              Confirm
            </button>
          )}
        </div>
      </>
    );
  }

  if (hasSelfSumbittedTurn) {
    <h1>Waiting for enemy...</h1>;
  }

  //#endregion

  return (
    <div className="battleScreen">
      <div className="battleScreenTop">
        <img className="topBackIcon" src="/img/back_line.png" alt="back" />
        {/*should change the main to be the screen to go back too after surrendering */}
        <button
          onClick={() => navigate("/home")}
          className="battleScreenTopButton"
        >
          Surrender
        </button>
      </div>

      <div className="battleMiddle">
        {/* monster 1 */}
        <BattleMonster
          image="/img/monster-image/dragon.png"
          alt="Monster 1"
          position="monster1"
        />

        {showAnimation && (
          <div className="diceAnimation">
            <img
              src="/img/d20.png"
              alt="Rolling animation"
              className="diceAnimation"
            />
            <span className="diceResult">{displayedNumber}</span>
          </div>
        )}
        {/* monster 2 */}
        <BattleMonster
          image="/img/monster-image/wolfman.png"
          alt="Monster 2"
          position="monster2"
        />
      </div>

      <div className="battleScreenBottom">
        <button
          className="battleScreenBottomButton"
          onClick={onSelectActionAttack}
        >
          <img
            className="battleScreenBottomButtonImage"
            src="/img/sword.png"
            alt="Sword"
          />
        </button>
        <button
          className="battleScreenBottomButton"
          onClick={() => console.warn("NOT implemented yet...")}
        >
          <img
            className="battleScreenBottomButtonImage"
            src="/img/ability.jpg"
            alt="Ability"
          />
        </button>
        <button
          className="battleScreenBottomButton"
          onClick={() => console.warn("NOT implemented yet...")}
        >
          <img
            className="battleScreenBottomButtonImage"
            src="/img/shield.png"
            alt="Shield"
          />
        </button>
      </div>
    </div>
  );
};
