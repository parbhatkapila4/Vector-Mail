
const SEARCH_LATENCIES_CAP = 100;
const searchLatencies: number[] = [];
let syncFailuresCount = 0;
let llmCallsCount = 0;

export function recordSearchLatency(ms: number): void {
  searchLatencies.push(ms);
  if (searchLatencies.length > SEARCH_LATENCIES_CAP) {
    searchLatencies.shift();
  }
}

export function getAverageSearchTimeMs(): number {
  if (searchLatencies.length === 0) return 0;
  const sum = searchLatencies.reduce((a, b) => a + b, 0);
  return Math.round(sum / searchLatencies.length);
}

export function incrementSyncFailure(): void {
  syncFailuresCount += 1;
}

export function getSyncFailures(): number {
  return syncFailuresCount;
}

export function incrementLlmCall(): void {
  llmCallsCount += 1;
}

export function getLlmCallsCount(): number {
  return llmCallsCount;
}
