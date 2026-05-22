const LATENCIES_CAP = 200;
const ROLLING_BUCKET_MS = 5 * 60 * 1000;

const searchLatencies: number[] = [];
const embeddingLatencies: number[] = [];
const recentEmbeddingFailures: number[] = [];
const recentSyncFailures: number[] = [];

let syncFailuresCount = 0;
let llmCallsCount = 0;
let embeddingFailuresCount = 0;
let embeddingCallsCount = 0;

function pushCapped(arr: number[], v: number): void {
  arr.push(v);
  if (arr.length > LATENCIES_CAP) arr.shift();
}

function pruneRolling(arr: number[], now: number): void {
  while (arr.length > 0 && (arr[0] ?? 0) < now - ROLLING_BUCKET_MS) {
    arr.shift();
  }
}

function percentile(arr: ReadonlyArray<number>, p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, Math.min(sorted.length - 1, idx))] ?? 0);
}

export function recordSearchLatency(ms: number): void {
  pushCapped(searchLatencies, ms);
}

export function getAverageSearchTimeMs(): number {
  if (searchLatencies.length === 0) return 0;
  const sum = searchLatencies.reduce((a, b) => a + b, 0);
  return Math.round(sum / searchLatencies.length);
}

export function getSearchP95Ms(): number {
  return percentile(searchLatencies, 95);
}

export function recordEmbeddingLatency(ms: number): void {
  embeddingCallsCount += 1;
  pushCapped(embeddingLatencies, ms);
}

export function getEmbeddingP95Ms(): number {
  return percentile(embeddingLatencies, 95);
}

export function getEmbeddingCallsCount(): number {
  return embeddingCallsCount;
}

export function incrementEmbeddingFailure(): void {
  embeddingFailuresCount += 1;
  recentEmbeddingFailures.push(Date.now());
  pruneRolling(recentEmbeddingFailures, Date.now());
}

export function getEmbeddingFailuresCount(): number {
  return embeddingFailuresCount;
}

export function getRecentEmbeddingFailureCount(): number {
  pruneRolling(recentEmbeddingFailures, Date.now());
  return recentEmbeddingFailures.length;
}

export function incrementSyncFailure(): void {
  syncFailuresCount += 1;
  recentSyncFailures.push(Date.now());
  pruneRolling(recentSyncFailures, Date.now());
}

export function getSyncFailures(): number {
  return syncFailuresCount;
}

export function getRecentSyncFailureCount(): number {
  pruneRolling(recentSyncFailures, Date.now());
  return recentSyncFailures.length;
}

export function incrementLlmCall(): void {
  llmCallsCount += 1;
}

export function getLlmCallsCount(): number {
  return llmCallsCount;
}
