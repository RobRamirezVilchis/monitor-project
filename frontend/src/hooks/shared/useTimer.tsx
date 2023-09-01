import { useCallback, useEffect, useMemo, useRef } from "react";
import { useImmer } from "use-immer";

export interface UseTimerOptions {
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
   * Stop the timer when the elapsed time in milliseconds reaches this value
   * @default undefined
   */
  stopAt?: number;
  /**
   * Reset the timer automatically when the elapsed time in milliseconds reaches `stopAt`
   * @default false
   */
  autoReset?: boolean;
  /**
   * Restart the timer automatically when the elapsed time in milliseconds reaches `stopAt`
   * @default false
   */
  autoRestart?: boolean;
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
   */
  stop: () => void;
  /**
   * Reset time to 0 without stopping the timer
   */
  restart: () => void;
  /**
   * Stop the timer and set time to 0
   */
  reset: () => void;
  status: TimerStatus;
  isRunning: boolean;
  isPaused: boolean;
  isStopped: boolean;
}

const defaultOptions: UseTimerOptions = {
  interval: 1000,
  autoStart: false,
  autoReset: false,
  autoRestart: false,
};

export const useTimer = (options?: UseTimerOptions): UseTimerReturn => {
  const opts = useMemo<UseTimerOptions>(() => ({
    ...defaultOptions,
    ...options,
  }), [options]);
  const [state, setState] = useImmer({
    time: 0,
    status: "stopped" as TimerStatus,
  });
  const _state = useRef({
    time: state.time,
    status:  state.status,
    autoStarted: false,
  });
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const baseTimeRef = useRef(0);
  const currentStartDateRef = useRef<Date | null>(null);

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
    const diff = (new Date().valueOf() - currentStartDateRef.current!.valueOf());
    baseTimeRef.current += diff;
    currentStartDateRef.current = null;
  }, [setState]);

  const stop = useCallback(() => {
    if (_state.current.status !== "running" && _state.current.status !== "paused") {
      return;
    }

    _state.current.status = "stopped";
    setState((draft) => {
      draft.status = "stopped";
    });

    clearTimerInterval();
    endDateRef.current = new Date();
    baseTimeRef.current = 0;

    opts?.onStop?.(_state.current.time);
  }, [setState, opts]);

  const reset = useCallback(() => {
    stop();
    _state.current.time = 0;
    setState((draft) => {
      draft.time = 0;
    });
  }, [stop, setState]);

  const start = useCallback(() => {
    const now = new Date();

    switch (_state.current.status) {
      case "running":
        return;
      case "paused":
        break;
      case "stopped":
        startDateRef.current = now;

        _state.current.time = 0;
        setState((draft) => {
          draft.time = 0;
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

      const diff = (new Date().valueOf() - currentStartDateRef.current!.valueOf());
      const newTime = baseTimeRef.current + diff;
      
      _state.current.time = newTime;
      setState((draft) => {
        draft.time = newTime;
      });

      opts?.onTick?.(newTime);

      if (opts.stopAt !== undefined && newTime >= opts.stopAt) {
        if (opts.autoRestart) {
          // We call stop since we want to trigger the onStop callback in here
          stop();
          start();
        }
        else if (opts.autoReset) {
          reset();
        }
        else {
          stop();
        }
      }
    }, opts.interval);
  }, [setState, opts, reset, stop]);

  const restart = useCallback(() => {
    _state.current.status = "stopped";

    clearTimerInterval();
    baseTimeRef.current = 0;

    start();
  }, [start]);

  /* eslint-disable react-hooks/exhaustive-deps */
  //? If the timer is running and the options change, update the timer interval
  useEffect(() => {
    if (_state.current.status === "running") {
      _state.current.status = "paused";
      const diff = (new Date().valueOf() - currentStartDateRef.current!.valueOf());
      baseTimeRef.current += diff;
      currentStartDateRef.current = null;
      start();
    }
  }, [opts]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    if (opts.autoStart && !_state.current.autoStarted) {
      _state.current.autoStarted = true;
      start();
    }
  }, [opts.autoStart, start]);

  const result = useMemo<UseTimerReturn>(() => ({
    time: {
      elapsed: state.time,
      hours: Math.floor(state.time / 1000 / 60 / 60),
      minutes: Math.floor(state.time / 1000 / 60) % 60,
      seconds: Math.floor(state.time / 1000) % 60,
      milliseconds: state.time % 1000,
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