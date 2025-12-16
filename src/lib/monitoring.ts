import { logger } from "./logger";

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: number;
}

interface WindowWithAnalytics extends Window {
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, unknown>,
  ) => void;
  Sentry?: {
    captureException: (
      error: Error,
      options?: { extra?: Record<string, unknown> },
    ) => void;
  };
}

class MetricsCollector {
  private metrics: MetricData[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window === "undefined") {
      this.startFlushInterval();
    }
  }

  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 60000);
  }

  record(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: Date.now(),
    });

    if (this.metrics.length > 100) {
      this.flush();
    }
  }

  increment(name: string, tags?: Record<string, string>) {
    this.record(name, 1, tags);
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.record(name, value, tags);
  }

  timing(name: string, duration: number, tags?: Record<string, string>) {
    this.record(name, duration, { ...tags, type: "timing" });
  }

  private flush() {
    if (this.metrics.length === 0) return;

    logger.debug("Flushing metrics", {
      count: this.metrics.length,
      metrics: this.metrics.slice(0, 10),
    });

    this.metrics = [];
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

export const metrics = new MetricsCollector();

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (process.env.NODE_ENV === "production") {
    logger.info(`Event: ${event}`, properties);

    if (typeof window !== "undefined") {
      const windowWithAnalytics = window as WindowWithAnalytics;
      if (windowWithAnalytics.gtag) {
        windowWithAnalytics.gtag("event", event, properties);
      }
    }
  } else {
    logger.debug(`Event: ${event}`, properties);
  }
}

export function trackError(error: Error, context?: Record<string, unknown>) {
  logger.error(error.message, {
    ...context,
    stack: error.stack,
    name: error.name,
  });

  metrics.increment("errors", {
    type: error.name,
  });

  if (typeof window !== "undefined") {
    const windowWithAnalytics = window as WindowWithAnalytics;
    if (windowWithAnalytics.Sentry) {
      windowWithAnalytics.Sentry.captureException(error, {
        extra: context,
      });
    }
  }
}

export function trackPageView(url: string) {
  trackEvent("page_view", { page_path: url });
}

export function trackUserAction(
  action: string,
  context?: Record<string, unknown>,
) {
  trackEvent("user_action", { action, ...context });
}
