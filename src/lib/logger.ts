type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface WindowWithSentry extends Window {
  Sentry?: {
    captureException: (
      error: Error,
      options?: { level?: string; extra?: Record<string, unknown> },
    ) => void;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) {
    const entry = this.formatMessage(level, message, context);

    if (this.isProduction) {
      if (typeof window !== "undefined") {
        const windowWithSentry = window as WindowWithSentry;
        if (windowWithSentry.Sentry && level === "error") {
          windowWithSentry.Sentry.captureException(new Error(message), {
            level,
            extra: context,
          });
        }
      }

      if (level === "error" || level === "warn") {
        console[level](JSON.stringify(entry));
      }
    } else {
      const styles = {
        info: "color: #3b82f6",
        warn: "color: #f59e0b",
        error: "color: #ef4444",
        debug: "color: #8b5cf6",
      };

      console.log(
        `%c[${entry.level.toUpperCase()}] ${entry.message}`,
        styles[level],
        context || "",
      );
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log("debug", message, context);
    }
  }
}

export const logger = new Logger();
