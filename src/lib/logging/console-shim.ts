import { serverLog } from "./server-logger";

export function makeTagLogger(tag: string): {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
} {
  const label = `[${tag}]`;
  return {
    log: (...args) => serverLog.info({ args }, label),
    info: (...args) => serverLog.info({ args }, label),
    warn: (...args) => serverLog.warn({ args }, label),
    error: (...args) => serverLog.error({ args }, label),
  };
}
