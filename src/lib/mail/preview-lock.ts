export interface PreviewLockState {
  currentTab: string;
  hasDbThreads: boolean;
  hasPreviewThreads: boolean;
  isSyncActive: boolean;
  previewStartedAtMs: number | null;
  nowMs: number;
  maxReadOnlyMs: number;
}

export function shouldKeepPreviewReadOnly(state: PreviewLockState): boolean {
  if (state.currentTab !== "inbox") return false;
  if (state.hasDbThreads) return false;
  if (!state.hasPreviewThreads) return false;
  if (!state.isSyncActive) return false;
  if (!state.previewStartedAtMs) return false;

  return state.nowMs - state.previewStartedAtMs < state.maxReadOnlyMs;
}
