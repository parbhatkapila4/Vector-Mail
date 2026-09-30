import { readFileSync } from "fs";
import { join } from "path";
import React from "react";
import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthCallbackPage from "../../app/auth/callback/page";
import SetSessionPage from "../../app/auth/set-session/page";
import {
  AuthHandoffFailure,
  AuthHandoffLoading,
  HANDOFF_TIMEOUT_MS,
} from "../../app/auth/AuthHandoff";

type MockSignIn = {
  isLoaded: boolean;
  signIn?: { create: jest.Mock };
  setActive?: jest.Mock;
};

let mockSignIn: MockSignIn;
let mockAuth: { isLoaded: boolean; isSignedIn: boolean; getToken: jest.Mock };
let mockSearchParams = new URLSearchParams();
const mockRouter = { replace: jest.fn() };

jest.mock("@clerk/nextjs", () => ({
  useSignIn: () => mockSignIn,
  useAuth: () => mockAuth,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

const create = jest.fn();
const setActive = jest.fn();
const replace = jest.fn();
const realLocation = window.location;

function visit(href: string) {
  const url = new URL(href);
  mockSearchParams = url.searchParams;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      href: url.href,
      protocol: url.protocol,
      hostname: url.hostname,
      replace,
    },
  });
}

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

const flush = () => act(async () => { });

const captures = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[1] ?? "");

beforeEach(() => {
  jest.useFakeTimers();
  create.mockReset().mockReturnValue(new Promise(() => { }));
  setActive.mockReset().mockResolvedValue(undefined);
  replace.mockReset();
  mockRouter.replace.mockReset();
  mockSignIn = { isLoaded: true, signIn: { create }, setActive };
  mockAuth = {
    isLoaded: true,
    isSignedIn: false,
    getToken: jest.fn().mockResolvedValue(null),
  };
});

afterEach(() => {
  jest.useRealTimers();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: realLocation,
  });
});

describe("/auth/callback", () => {
  it("shows the inbox shell with a quiet status line instead of a spinner", () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_1&accountId=acc_1");
    render(<AuthCallbackPage />);

    expect(screen.getByRole("status")).toHaveTextContent("Signing you in…");
    expect(
      document.querySelector('[aria-label="Loading your inbox"]'),
    ).toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeNull();
  });

  it("hands off to /mail for the new account and stops the clock once it has", async () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_1&accountId=acc_1");
    create.mockResolvedValue({ status: "complete", createdSessionId: "sess_1" });
    render(<AuthCallbackPage />);
    await flush();

    expect(setActive).toHaveBeenCalledWith({ session: "sess_1" });
    expect(replace).toHaveBeenCalledWith("/mail?accountId=acc_1");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Taking you to your inbox…",
    );

    advance(60_000);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("goes through dev-session on http://localhost without timing out on the way", async () => {
    visit("http://localhost:3000/auth/callback?ticket=tkt_1&accountId=acc_1");
    create.mockResolvedValue({ status: "complete", createdSessionId: "sess_1" });
    mockAuth.getToken.mockResolvedValue("jwt_1");
    render(<AuthCallbackPage />);
    await flush();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(replace).toHaveBeenCalledWith(
      "/api/auth/dev-session?token=jwt_1&redirectTo=%2Fmail%3FaccountId%3Dacc_1",
    );
    advance(60_000);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("explains a rejected ticket and links home", async () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_used");
    create.mockRejectedValue(new Error("Sign in token has already been used."));
    render(<AuthCallbackPage />);
    await flush();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("We couldn't finish signing you in");
    expect(alert).toHaveTextContent("Sign in token has already been used.");
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("explains a link with no ticket", () => {
    visit("https://vectormail.test/auth/callback");
    render(<AuthCallbackPage />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "That sign-in link is incomplete",
    );
    expect(create).not.toHaveBeenCalled();
  });

  it("stops waiting and links home if the sign-in hangs", () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_1");
    render(<AuthCallbackPage />);

    advance(HANDOFF_TIMEOUT_MS - 1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    advance(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Signing in is taking too long",
    );
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("stops waiting if Clerk never loads", () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_1");
    mockSignIn = { isLoaded: false };
    render(<AuthCallbackPage />);

    advance(HANDOFF_TIMEOUT_MS);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Signing in is taking too long",
    );
  });

  it("still goes through if the sign-in finishes after the timeout", async () => {
    visit("https://vectormail.test/auth/callback?ticket=tkt_1");
    let finish: (value: unknown) => void = () => { };
    create.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<AuthCallbackPage />);

    advance(HANDOFF_TIMEOUT_MS);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await act(async () =>
      finish({ status: "complete", createdSessionId: "sess_1" }),
    );
    expect(replace).toHaveBeenCalledWith("/mail");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Taking you to your inbox…",
    );
  });
});

describe("/auth/set-session", () => {
  it("shows the inbox shell and hands off to /mail without timing out on the way", async () => {
    visit("https://vectormail.test/auth/set-session");
    mockAuth.getToken.mockResolvedValue("jwt_1");
    render(<SetSessionPage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Taking you to your inbox…",
    );
    expect(document.querySelector(".animate-spin")).toBeNull();

    await flush();
    expect(mockRouter.replace).toHaveBeenCalledWith("/mail");

    advance(60_000);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("stops waiting and links home if Clerk never loads", () => {
    visit("https://vectormail.test/auth/set-session");
    mockAuth.isLoaded = false;
    render(<SetSessionPage />);

    advance(HANDOFF_TIMEOUT_MS);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Opening your inbox is taking too long",
    );
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});

describe("auth handoff screens", () => {
  it("only paint with tokens the root layout loads", () => {
    const { container } = render(
      <>
        <AuthHandoffLoading status="Signing you in…" />
        <AuthHandoffFailure heading="Heading" body="Body" detail="Detail" />
      </>,
    );
    const src = join(__dirname, "../..");
    const layout = readFileSync(join(src, "app/layout.tsx"), "utf8");
    const globalTokens = new Set(
      captures(layout, /^import ["']@\/(.+\.css)["'];$/gm).flatMap((sheet) =>
        captures(readFileSync(join(src, sheet), "utf8"), /(--[\w-]+)\s*:/g),
      ),
    );
    const used = new Set(captures(container.innerHTML, /var\((--[\w-]+)/g));

    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((token) => !globalTokens.has(token))).toEqual([]);
  });
});
