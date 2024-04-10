import React, { useState, useEffect } from "react";

import styles from "./Root.module.css";

const acwTimer = 30; //After Contact Work Timer is 30 seconds

function Root({ api, interactionId }) {
  const [agentState, setAgentState] = useState(null);

  // Handle State for Agent State in "ACW" and "ACTIVE"
  const [timerVisible, setTimerVisible] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // useEffect to get agent state to fix issue with too many re-renders with api
  useEffect(() => {
    api.onDataEvent("onInteractionEvent", (data) => {
      for (let i of Object.keys(data)) {
        if (i === "state") {
          setAgentState(data[i]);
        }
      }
    });
  }, [api]);

  // useEffect for Agent State "ACW" and "ACTIVE"
  useEffect(() => {
    console.log("agent state in Root is :", agentState);

    const handleStatusChange = () => {
      setTimerVisible(agentState === "ACW" || agentState === "ACTIVE");

      if (agentState === "ACW" || agentState === "ACTIVE") {
        // Start or reset the timer logic
        setStartTime(performance.now());

        const updateElapsedTime = () => {
          setStartTime((prevStartTime) => {
            const currentTime = performance.now();
            const elapsedSeconds = Math.floor(
              (currentTime - prevStartTime) / 1000
            );
            // Update the elapsed time
            setElapsedTime(elapsedSeconds);

            if (elapsedSeconds === acwTimer && agentState === "ACW") {
              // Finish Interaction
              api.finishInteraction(interactionId);
              // finishInteraction();
            }
            return prevStartTime;
          });
        };

        // Update the elapsed time every second
        const timerInterval = setInterval(updateElapsedTime, 1000);

        // Clean up the interval when the component unmounts or when the status changes
        return () => {
          clearInterval(timerInterval);
          setStartTime(null);
        };
      }
    };

    handleStatusChange();
  }, [agentState]);

  return (
    <div className={styles.container}>
      {acwTimer && (
        <div>
          <div>After Contact Work Timer : {`${acwTimer} sec`}</div>
        </div>
      )}
      {timerVisible && agentState && (
        <div className={styles.agentState}>
          <div>Agent State:</div>
          <div>{agentState}</div>
          <div>{formatTime(elapsedTime)}</div>
        </div>
      )}
    </div>
  );
}

export default Root;
