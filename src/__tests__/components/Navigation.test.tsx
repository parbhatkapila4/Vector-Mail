import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Navigation } from "../../components/landing/Navigation";
import { useUser, useAuth } from "@clerk/nextjs";

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
  useAuth: jest.fn(),
  useClerk: () => ({ signOut: jest.fn() }),
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

jest.mock("../../components/mail-navigation-loader", () => ({
  useMailNavigation: () => ({ navigateToMail: jest.fn(), isNavigating: false }),
}));

describe("Navigation Component", () => {
  it("renders without throwing when signed out", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });
    const { container } = render(<Navigation />);
    expect(container).toBeTruthy();
    expect(container.querySelector("nav, header")).not.toBeNull();
  });

  it("renders without throwing when signed in", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { fullName: "John Doe", firstName: "John" },
    });
    const { container } = render(<Navigation />);
    expect(container).toBeTruthy();
    expect(container.querySelector("nav, header")).not.toBeNull();
  });

  it("signed-in and signed-out states render different DOM", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
    });
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });
    const out = render(<Navigation />).container.innerHTML;

    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
    });
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: { fullName: "John Doe", firstName: "John" },
    });
    const into = render(<Navigation />).container.innerHTML;
    expect(out).not.toEqual(into);
  });
});
