import { readFileSync } from "fs";
import { join } from "path";
import React, { startTransition, useContext, useMemo, useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  MailNavigationProvider,
  useMailNavigation,
} from "../../components/mail-navigation-loader";

type Route = { pathname: string };
type PendingRoute = Promise<void> & { route?: Route };
type Navigation = { finish: (pathname?: string) => void };

const MockRouterContext = React.createContext<{
  push: (href: string) => void;
} | null>(null);
const MockPathnameContext = React.createContext("/");

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouterHooks.useRouter(),
  usePathname: () => mockRouterHooks.usePathname(),
}));

const mockRouterHooks = {
  useRouter: () => useContext(MockRouterContext),
  usePathname: () => useContext(MockPathnameContext),
};
function MockAppRouter({
  pages,
  navigation,
}: {
  pages: Record<string, React.ReactNode>;
  navigation: Navigation;
}) {
  const [state, setState] = useState<Route | PendingRoute>({ pathname: "/" });
  const router = useMemo(
    () => ({
      push(href: string) {
        const pending: PendingRoute = new Promise<void>((resolve) => {
          navigation.finish = (pathname = href) => {
            pending.route = { pathname };
            resolve();
          };
        });
        startTransition(() => setState(pending));
      },
    }),
    [navigation],
  );

  const route = state instanceof Promise ? state.route : state;
  if (!route) throw state;

  return (
    <MockRouterContext.Provider value={router}>
      <MockPathnameContext.Provider value={route.pathname}>
        <MailNavigationProvider>{pages[route.pathname]}</MailNavigationProvider>
      </MockPathnameContext.Provider>
    </MockRouterContext.Provider>
  );
}

function Landing() {
  const { navigateToMail, isNavigating } = useMailNavigation();
  return (
    <header>
      <span>landing navbar</span>
      <button type="button" onClick={navigateToMail} disabled={isNavigating}>
        {isNavigating ? "Opening..." : "Open VectorMail"}
      </button>
    </header>
  );
}

function renderApp() {
  const navigation: Navigation = { finish: () => {} };
  render(
    <MockAppRouter
      navigation={navigation}
      pages={{ "/": <Landing />, "/mail": <main>inbox</main> }}
    />,
  );
  return navigation;
}

const openVectorMail = () =>
  fireEvent.click(screen.getByRole("button", { name: "Open VectorMail" }));

const overlays = () =>
  screen.queryAllByRole("status", { name: "Loading your inbox" });

const captures = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[1] ?? "");

describe("MailNavigationProvider", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("keeps the overlay over the landing page until /mail commits, however long that takes", async () => {
    jest.useFakeTimers();
    const navigation = renderApp();

    openVectorMail();
    expect(overlays()).not.toHaveLength(0);
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(overlays()).not.toHaveLength(0);
    expect(screen.getByRole("button", { name: "Opening..." })).toBeDisabled();

    await act(async () => navigation.finish());
    expect(overlays()).toHaveLength(0);
    expect(screen.queryByText("landing navbar")).not.toBeInTheDocument();
    expect(screen.getByText("inbox")).toBeInTheDocument();
  });

  it("drops the overlay when the navigation settles somewhere other than /mail", async () => {
    const navigation = renderApp();

    openVectorMail();
    expect(overlays()).not.toHaveLength(0);

    await act(async () => navigation.finish("/"));
    expect(overlays()).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "Open VectorMail" }),
    ).toBeEnabled();
  });

  it("paints the overlay only with tokens the root layout loads", () => {
    renderApp();
    openVectorMail();
    const src = join(__dirname, "../..");
    const layout = readFileSync(join(src, "app/layout.tsx"), "utf8");
    const globalTokens = new Set(
      captures(layout, /^import ["']@\/(.+\.css)["'];$/gm).flatMap((sheet) =>
        captures(readFileSync(join(src, sheet), "utf8"), /(--[\w-]+)\s*:/g),
      ),
    );
    const used = new Set(
      captures(overlays()[0]?.outerHTML ?? "", /var\((--[\w-]+)/g),
    );

    expect(used.size).toBeGreaterThan(0);
    expect([...used].filter((token) => !globalTokens.has(token))).toEqual([]);
  });
});
