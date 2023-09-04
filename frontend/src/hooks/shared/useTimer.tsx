import { useCallback, useEffect, useMemo, useRef } from "react";
import { useImmer } from "use-immer";

export interface UseTimerOptions {
  /**
   * Initial time in milliseconds used on first start
   * @default 0
   */
  initialTime?: number;
  /**
   * Interval in milliseconds in which the timer will tick
   * @default 1000
   */
  interval?: number;
  /**
   * Start the timer automatically when the component mounts
   * @default false
   */
  autoStart?: boolean;
  /**
   * If set, stop the timer when the elapsed time in milliseconds reaches the given value
   * @default undefined
   */
  stopAt?: number;
  /**
   * If set, reset the timer automatically to the given time in milliseconds when the elapsed time reaches `stopAt`.
   * @default undefined
   */
  autoReset?: number;
  /**
   * If set, restart the timer automatically to the given time in milliseconds when the elapsed time reaches `stopAt`.
   * This overrides `autoReset`.
   * @default undefined
   */
  autoRestart?: number;
  /**
   * Callback when the timer ticks (every interval)
   * @param time Current elapsed time in milliseconds
   */
  onTick?: (time: number) => void;
  /**
   * Callback when the timer stops
   * @param time Total elapsed time in milliseconds
   */
  onStop?: (time: number) => void;
}

export type TimerStatus = "running" | "paused" | "stopped";

export interface UseTimerReturn {
  time: {
    /**
     * Total elapsed time in milliseconds
     */
    elapsed: number;

    /**
     * Hours elapsed
     */
    hours: number;
    /**
     * Minutes elapsed
     */
    minutes: number;
    /**
     * Seconds elapsed
     */
    seconds: number;
    /**
     * Milliseconds elapsed
     */
    milliseconds: number;
  };
  /**
   * Start or resume timer
   */
  start: () => void;
  /**
   * Pause timer
   */
  pause: () => void;
  /**
   * Stop timer
   * @param time Initial time in milliseconds for the next start
   * @default 0
   */
  stop: (time?: number) => void;
  /**
   * Reset time to 0 without stopping the timer
   * @param time Initial time in milliseconds for the next start
   * @default 0
   */
  restart: (time?: number) => void;
  /**
   * Stop the timer and set time to 0
   * @param time Initial time in milliseconds for the next start
   * @default 0
   */
  reset: (time?: number) => void;
  status: TimerStatus;
  isRunning: boolean;
  isPaused: boolean;
  isStopped: boolean;
}

/**
 * Timer hook that support both incremental and decremental timers
 */
export const useTimer = ({
  initialTime = 0, 
  interval = 1000, 
  autoStart = false, 
  stopAt, 
  autoReset, 
  autoRestart, 
  onTick, 
  onStop,
}: UseTimerOptions): UseTimerReturn => {
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const baseTimeRef = useRef(
    stopAt !== undefined 
    ? Math.min(initialTime ?? 0, stopAt) 
    : initialTime ?? 0
  );
  const currentStartDateRef = useRef<Date | null>(null);

  const [state, setState] = useImmer<{ time: number, status: TimerStatus }>({
    time: baseTimeRef.current,
    status: "stopped",
  });
  const _state = useRef({
    time: state.time,
    status:  state.status,
    autoStarted: false,
  });

  const startDateRef = useRef<Date | null>(null); // not used for now
  const endDateRef = useRef<Date | null>(null); // not used for now
 
  const clearTimerInterval = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const pause = useCallback(() => {
    if (_state.current.status !== "running")
      return;

    _state.current.status = "paused";
    setState((draft) => {
      draft.status = "paused";
    });

    clearTimerInterval();
    let diff = new Date().valueOf() - currentStartDateRef.current!.valueOf();
    if (stopAt !== undefined)
      diff = Math.min(diff, stopAt - baseTimeRef.current);
    baseTimeRef.current += diff;
    currentStartDateRef.current = null;
  }, [setState, stopAt]);

  const stop = useCallback((time?: number) => {
    if (_state.current.status !== "running" && _state.current.status !== "paused") {
      return;
    }

    _state.current.status = "stopped";
    setState((draft) => {
      draft.status = "stopped";
    });

    clearTimerInterval();
    endDateRef.current = new Date();
    baseTimeRef.current = time ?? 0;

    onStop?.(_state.current.time);
  }, [setState, onStop]);

  const start = useCallback(() => {
    const now = new Date();

    switch (_state.current.status) {
      case "running":
        return;
      case "paused":
        break;
      case "stopped":
        startDateRef.current = now;

        _state.current.time = baseTimeRef.current;
        setState((draft) => {
          draft.time = baseTimeRef.current;
        });
        break;
    }

    currentStartDateRef.current = now;
    endDateRef.current = null;

    _state.current.status = "running";
    setState((draft) => {
      draft.status = "running";
    });

    clearTimerInterval();
    timerIntervalRef.current = setInterval(() => {
      if (_state.current.status !== "running")
        return;

      const diff = new Date().valueOf() - currentStartDateRef.current!.valueOf();
      let newTime = baseTimeRef.current + diff;
      if (stopAt !== undefined)
        newTime = Math.min(newTime, stopAt);
      
      _state.current.time = newTime;
      setState((draft) => {
        draft.time = newTime;
      });

      onTick?.(newTime);

      if (stopAt !== undefined && newTime >= stopAt) {
        stop(autoRestart ?? autoReset);

        if (autoRestart !== undefined) {
          start();
        }
        else if (autoReset !== undefined) {
          _state.current.time = autoReset ?? 0;
          setState((draft) => {
            draft.time = autoReset ?? 0;
          });
        }
      }
    }, interval);
  }, [setState, stop, onTick, interval, stopAt, autoReset, autoRestart]);

  const restart = useCallback((time?: number) => {
    _state.current.status = "stopped";

    clearTimerInterval();
    baseTimeRef.current = time ?? 0;

    start();
  }, [start]);

  const reset = useCallback((time?: number) => {
    stop(time);
    _state.current.time = time ?? 0;
    setState((draft) => {
      draft.time = time ?? 0;
    });
  }, [stop, setState]);

  /* eslint-disable react-hooks/exhaustive-deps */
  //? If the timer is running and the options change, update the timer interval
  useEffect(() => {
    if (_state.current.status === "running") {
      _state.current.status = "paused";
      let diff = new Date().valueOf() - currentStartDateRef.current!.valueOf();
      if (stopAt !== undefined)
        diff = Math.min(diff, stopAt - baseTimeRef.current);
      baseTimeRef.current += diff;
      currentStartDateRef.current = null;
      start();
    }
  }, [initialTime, interval, autoStart, stopAt, autoReset, autoRestart, onTick, onStop]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (autoStart && !_state.current.autoStarted) {
      _state.current.autoStarted = true;
      start();
    }
  }, [autoStart, start]);

  useEffect(() => {
    return () => clearTimerInterval();
  }, []);

  const result = useMemo<UseTimerReturn>(() => ({
    time: {
      elapsed: state.time,
      hours: Math.floor(Math.abs(state.time / 1000 / 60 / 60)),
      minutes: Math.floor(Math.abs(state.time / 1000 / 60) % 60),
      seconds: Math.floor(Math.abs(state.time / 1000) % 60),
      milliseconds: Math.abs(state.time % 1000),
    },
    start,
    pause,
    stop,
    restart,
    reset,
    status: state.status,
    isRunning: state.status === "running",
    isPaused: state.status === "paused",
    isStopped: state.status === "stopped",
  }), [state, start, pause, stop, restart, reset]);

  return result;
}