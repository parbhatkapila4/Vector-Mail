import { render, screen } from "@testing-library/react";
import { Navigation } from "@/components/landing/Navigation";
import { useUser } from "@clerk/nextjs";

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
  UserButton: () => <div data-testid="user-button">User Button</div>,
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe("Navigation Component", () => {
  describe("when user is logged out", () => {
    beforeEach(() => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: false,
        user: null,
      });
    });

    it("renders Features, Pricing, About links", () => {
      render(<Navigation />);
      expect(screen.getAllByText("Features")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Pricing")[0]).toBeInTheDocument();
      expect(screen.getAllByText("About")[0]).toBeInTheDocument();
    });

    it("renders Login button instead of Inbox", () => {
      render(<Navigation />);
      expect(screen.getAllByText("Login")[0]).toBeInTheDocument();
      expect(screen.queryByText("Inbox")).not.toBeInTheDocument();
    });

    it("does not show duplicate pricing link", () => {
      render(<Navigation />);
      const pricingLinks = screen.getAllByText("Pricing");
      expect(pricingLinks.length).toBe(2);
    });
  });

  describe("when user is logged in", () => {
    beforeEach(() => {
      (useUser as jest.Mock).mockReturnValue({
        isSignedIn: true,
        user: {
          fullName: "John Doe",
          firstName: "John",
        },
      });
    });

    it("renders Inbox link instead of About", () => {
      render(<Navigation />);
      expect(screen.getAllByText("Inbox")[0]).toBeInTheDocument();
      expect(screen.queryByText("About")).not.toBeInTheDocument();
    });

    it("renders user button and name", () => {
      render(<Navigation />);
      expect(screen.getAllByTestId("user-button")[0]).toBeInTheDocument();
      expect(screen.getAllByText("John Doe")[0]).toBeInTheDocument();
    });

    it("does not render Login button", () => {
      render(<Navigation />);
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
  });
});
