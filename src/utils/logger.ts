type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL: LogLevel = process.env.NODE_ENV === "production" ? "warn" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[MIN_LEVEL];
}

function format(module: string, message: string): string {
  return `[${module}] ${message}`;
}

export function createLogger(module: string) {
  return {
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog("debug")) console.debug(format(module, message), ...args);
    },
    info: (message: string, ...args: unknown[]) => {
      if (shouldLog("info")) console.info(format(module, message), ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
      if (shouldLog("warn")) console.warn(format(module, message), ...args);
    },
    error: (message: string, ...args: unknown[]) => {
      if (shouldLog("error")) console.error(format(module, message), ...args);
    },
  };
}
