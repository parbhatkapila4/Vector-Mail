import { getRequestId } from "@/lib/correlation";

const isProduction = process.env.NODE_ENV === "production";

function mergeContext(obj: Record<string, unknown> | undefined): Record<string, unknown> {
  const requestId = getRequestId();
  const base = requestId ? { requestId } : {};
  return obj ? { ...base, ...obj } : base;
}

function logLine(
  level: string,
  obj: Record<string, unknown> | undefined,
  msg?: string,
) {
  const payload = mergeContext(obj ?? {});
  const time = new Date().toISOString();
  const entry = {
    level,
    time,
    ...payload,
    ...(msg !== undefined && { msg }),
  };
  if (isProduction) {
    console.log(JSON.stringify(entry));
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    const msgLine = msg ?? (entry.msg as string | undefined) ?? "";
    const rest = { ...payload };
    delete (rest as Record<string, unknown>).msg;
    console.log(prefix, msgLine, Object.keys(rest).length > 0 ? rest : "");
  }
}

const serverLogger = {
  info(objOrMsg: Record<string, unknown> | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      logLine("info", {}, objOrMsg);
    } else {
      logLine("info", objOrMsg, msg);
    }
  },
  warn(objOrMsg: Record<string, unknown> | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      logLine("warn", {}, objOrMsg);
    } else {
      logLine("warn", objOrMsg, msg);
    }
  },
  error(objOrMsg: Record<string, unknown> | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      logLine("error", {}, objOrMsg);
    } else {
      logLine("error", objOrMsg, msg);
    }
  },
  debug(objOrMsg: Record<string, unknown> | string, msg?: string): void {
    if (typeof objOrMsg === "string") {
      logLine("debug", {}, objOrMsg);
    } else {
      logLine("debug", objOrMsg, msg);
    }
  },
};

export type ServerLogger = typeof serverLogger;
export const serverLog = serverLogger;
