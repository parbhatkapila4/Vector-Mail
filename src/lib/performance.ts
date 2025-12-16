import { logger } from "./logger";

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number | null {
    const start = this.marks.get(label);
    if (!start) {
      logger.warn(`Performance mark "${label}" not found`);
      return null;
    }

    const duration = performance.now() - start;
    this.marks.delete(label);

    logger.debug(`Performance: ${label} took ${duration.toFixed(2)}ms`, {
      label,
      duration,
    });

    return duration;
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  clear(): void {
    this.marks.clear();
  }
}

export const perf = new PerformanceMonitor();

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)! as ReturnType<T>;
    }

    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  label?: string;
}

interface WindowWithGtag extends Window {
  gtag?: (
    command: string,
    targetId: string,
    config?: Record<string, unknown>,
  ) => void;
}

export function measureWebVitals(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === "production") {
    logger.info("Web Vital", {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      label: metric.label,
    });

    if (typeof window !== "undefined") {
      const windowWithGtag = window as WindowWithGtag;
      if (windowWithGtag.gtag) {
        windowWithGtag.gtag("event", metric.name, {
          value: Math.round(
            metric.name === "CLS" ? metric.value * 1000 : metric.value,
          ),
          event_label: metric.id,
          non_interaction: true,
        });
      }
    }
  }
}
