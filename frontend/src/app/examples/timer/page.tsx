"use client";

import { UseTimerOptions, useTimer } from "@/hooks/shared/useTimer";
import { useState } from "react";

const withTrailingZeros = (num: number, digits: number) => num.toString().padStart(digits, "0");

const TimerExample = () => {
  const [timerOptions, setTimerOptions] = useState<UseTimerOptions>({
    key: "test",

    interval: 50,
    // autoStart: true,
    
    // initialTime: 5 * 1000,
    // stopAt: 10 * 1000,
    // autoReset: 0 * 1000,
    // autoRestart: 0 * 1000,

    // initialTime: -5 * 1000,
    // stopAt: 0 * 1000,
    // autoReset: -5 * 1000,
    // autoRestart: -5 * 1000,
    onStop: time => console.log("onStop", time),
  });
  const timer = useTimer(timerOptions);

  return (
    <div className="flex gap-4 p-2 items-center">
      <div>
        <p>
          Time: [{withTrailingZeros(timer.time.hours, 2)}:
          {withTrailingZeros(timer.time.minutes, 2)}:
          {withTrailingZeros(timer.time.seconds, 2)}.
          {withTrailingZeros(timer.time.milliseconds, 3)}]
        </p>
        <p>{timer.loading ? "---" : (
          <>{withTrailingZeros(timer.time.hours, 2)}:
          {withTrailingZeros(timer.time.minutes, 2)}:
          {withTrailingZeros(timer.time.seconds, 2)}.
          {withTrailingZeros(timer.time.milliseconds, 3)}</>
        )}</p>
        <p>Elapsed: {timer.time.elapsed / 1000}</p>
        <p>Estatus: {timer.status}</p>
        <p>Loading: {timer.loading ? "True" : "False"}</p>
      </div>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={timer.start}
      >
        {timer.isPaused ? "Resume" : "Start"}
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={timer.pause}
      >
        Pause
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.stop()}
        // onClick={() => timer.stop(3 * 1000)}
      >
        Stop
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.restart()}
        // onClick={() => timer.restart(5 * 1000)}
      >
        Restart
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => timer.reset()}
        // onClick={() => timer.reset(10 * 1000)}
      >
        Reset
      </button>

      <button
        className="bg-blue-500 text-white rounded-md p-2"
        onClick={() => {
          const newOptions: UseTimerOptions = {
            onTick: (time) => console.log(time),
            autoStart: true,
            stopAt: 15 * 1000,
            onStop: (time) => console.log("onStop", time),
          };
          setTimerOptions(newOptions);
        }}
      >
        Update timer options
      </button>
    </div>
  );
}

export default TimerExample;
