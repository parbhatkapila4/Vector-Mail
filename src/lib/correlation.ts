
import { AsyncLocalStorage } from "async_hooks";

const requestIdStorage = new AsyncLocalStorage<string>();

const REQUEST_ID_HEADER = "x-request-id";

export function getRequestId(): string | undefined {
  return requestIdStorage.getStore();
}


export function generateRequestId(): string {
  return crypto.randomUUID();
}


export function getOrCreateRequestId(headers: Headers): string {
  const fromHeader = headers.get(REQUEST_ID_HEADER);
  if (fromHeader?.trim()) {
    return fromHeader.trim();
  }
  return generateRequestId();
}

export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return requestIdStorage.run(requestId, fn);
}

export async function runWithRequestIdAsync<T>(
  requestId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return requestIdStorage.run(requestId, fn);
}

export { REQUEST_ID_HEADER };
