import {
  signSessionCookieValue,
  verifySessionCookieValue,
} from "@/lib/session-cookie";

const SECRET = "test-signing-secret";
const OTHER_SECRET = "a-different-signing-secret";

describe("session cookie signing", () => {
  const original = process.env.SESSION_COOKIE_SECRET;
  const originalClerk = process.env.CLERK_SECRET_KEY;

  beforeEach(() => {
    process.env.SESSION_COOKIE_SECRET = SECRET;
    delete process.env.CLERK_SECRET_KEY;
  });

  afterAll(() => {
    if (original === undefined) delete process.env.SESSION_COOKIE_SECRET;
    else process.env.SESSION_COOKIE_SECRET = original;
    if (originalClerk === undefined) delete process.env.CLERK_SECRET_KEY;
    else process.env.CLERK_SECRET_KEY = originalClerk;
  });

  it("round-trips a signed value", async () => {
    const signed = await signSessionCookieValue("user_abc123");
    expect(signed).not.toBeNull();
    expect(signed).toContain("user_abc123.");
    await expect(verifySessionCookieValue(signed)).resolves.toBe("user_abc123");
  });
  it("rejects a bare unsigned user id", async () => {
    await expect(verifySessionCookieValue("user_victim")).resolves.toBeNull();
  });

  it("rejects a forged signature", async () => {
    const signed = await signSessionCookieValue("user_abc123");
    const forged = `user_victim.${signed!.split(".")[1]}`;
    await expect(verifySessionCookieValue(forged)).resolves.toBeNull();
  });

  it("rejects a value signed with a different secret", async () => {
    const signed = await signSessionCookieValue("user_abc123");
    process.env.SESSION_COOKIE_SECRET = OTHER_SECRET;
    await expect(verifySessionCookieValue(signed)).resolves.toBeNull();
  });

  it("rejects malformed and empty values", async () => {
    for (const bad of ["", "   ", ".", ".sig", "user_abc123.", "user_abc123.short"]) {
      await expect(verifySessionCookieValue(bad)).resolves.toBeNull();
    }
    await expect(verifySessionCookieValue(null)).resolves.toBeNull();
    await expect(verifySessionCookieValue(undefined)).resolves.toBeNull();
  });

  it("preserves user ids that contain a hyphen, such as the demo account", async () => {
    const signed = await signSessionCookieValue("demo-user");
    await expect(verifySessionCookieValue(signed)).resolves.toBe("demo-user");
  });
  it("rejects everything when no signing secret is configured", async () => {
    const signed = await signSessionCookieValue("user_abc123");
    delete process.env.SESSION_COOKIE_SECRET;
    await expect(verifySessionCookieValue(signed)).resolves.toBeNull();
    await expect(signSessionCookieValue("user_abc123")).resolves.toBeNull();
  });

  it("falls back to CLERK_SECRET_KEY when SESSION_COOKIE_SECRET is unset", async () => {
    delete process.env.SESSION_COOKIE_SECRET;
    process.env.CLERK_SECRET_KEY = SECRET;
    const signed = await signSessionCookieValue("user_abc123");
    await expect(verifySessionCookieValue(signed)).resolves.toBe("user_abc123");
  });
});
