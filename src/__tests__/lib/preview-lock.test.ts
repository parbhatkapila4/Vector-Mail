import { shouldKeepPreviewReadOnly } from "../../lib/mail/preview-lock";

describe("preview lock guard", () => {
  const now = 10_000;
  const maxReadOnlyMs = 25_000;

  it("keeps preview read-only while sync is active and within timeout", () => {
    expect(
      shouldKeepPreviewReadOnly({
        currentTab: "inbox",
        hasDbThreads: false,
        hasPreviewThreads: true,
        isSyncActive: true,
        previewStartedAtMs: now - 5_000,
        nowMs: now,
        maxReadOnlyMs,
      }),
    ).toBe(true);
  });

  it("unlocks preview after timeout", () => {
    expect(
      shouldKeepPreviewReadOnly({
        currentTab: "inbox",
        hasDbThreads: false,
        hasPreviewThreads: true,
        isSyncActive: true,
        previewStartedAtMs: now - 30_000,
        nowMs: now,
        maxReadOnlyMs,
      }),
    ).toBe(false);
  });

  it("does not lock preview when sync is inactive", () => {
    expect(
      shouldKeepPreviewReadOnly({
        currentTab: "inbox",
        hasDbThreads: false,
        hasPreviewThreads: true,
        isSyncActive: false,
        previewStartedAtMs: now - 1_000,
        nowMs: now,
        maxReadOnlyMs,
      }),
    ).toBe(false);
  });

  it("does not lock outside inbox or when DB threads exist", () => {
    expect(
      shouldKeepPreviewReadOnly({
        currentTab: "sent",
        hasDbThreads: false,
        hasPreviewThreads: true,
        isSyncActive: true,
        previewStartedAtMs: now - 1_000,
        nowMs: now,
        maxReadOnlyMs,
      }),
    ).toBe(false);

    expect(
      shouldKeepPreviewReadOnly({
        currentTab: "inbox",
        hasDbThreads: true,
        hasPreviewThreads: true,
        isSyncActive: true,
        previewStartedAtMs: now - 1_000,
        nowMs: now,
        maxReadOnlyMs,
      }),
    ).toBe(false);
  });
});
