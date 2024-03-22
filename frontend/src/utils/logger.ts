interface Logger {
  /** 
   * 'log' is always shown unless the logger level is set to 'off' 
   * */
  log: (...args: any[]) => void;

  trace: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;

  setLevel: (logLevel: LogLevel) => void;
  getLevel: () => LogLevel;
}

const emptyFunc = () => {};

const defaultLogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || "info").toLowerCase();

const defaultLoggers: Omit<Logger, "setLevel" | "getLevel"> = {
  log: console.log,
  trace: console.trace,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

const logLevels = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
] as const;

type LogLevel = typeof logLevels[number] | "off";

const logger: Logger = {
  ...defaultLoggers,

  setLevel: (logLevel: LogLevel) => {
    setDefaults();
    
    for (const level of logLevels) {
      if (level === logLevel) break;
  
      logger[level] = emptyFunc;
    }

    if (logLevel === "off") logger.log = emptyFunc;

    logger.getLevel = () => logLevel;
  },
  getLevel: () => defaultLogLevel as LogLevel,
};

function setDefaults() {
  logger.log = defaultLoggers.log;
  logger.trace = defaultLoggers.trace;
  logger.debug = defaultLoggers.debug;
  logger.info = defaultLoggers.info;
  logger.warn = defaultLoggers.warn;
  logger.error = defaultLoggers.error;
}

logger.setLevel(defaultLogLevel as LogLevel);

export default logger;
