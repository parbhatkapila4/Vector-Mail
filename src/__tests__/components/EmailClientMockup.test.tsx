import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmailClientMockup } from "../../components/landing/EmailClientMockup";

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("EmailClientMockup Component", () => {
  it("renders the email mockup interface", () => {
    render(<EmailClientMockup />);
    expect(screen.getAllByText("Inbox")[0]).toBeInTheDocument();
    expect(screen.getByText("Drafts")).toBeInTheDocument();
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("displays VectorMail specific content", () => {
    render(<EmailClientMockup />);
    expect(screen.getByText(/VectorMail Team/i)).toBeInTheDocument();
  });

  it("shows AI summary section", () => {
    render(<EmailClientMockup />);
    expect(screen.getByText(/AI Summary/i)).toBeInTheDocument();
  });

  it("displays email attachments", () => {
    render(<EmailClientMockup />);
    expect(screen.getByText(/dashboard-mockup.fig/i)).toBeInTheDocument();
    expect(screen.getByText(/product-roadmap.docx/i)).toBeInTheDocument();
  });

  it("renders search functionality", () => {
    render(<EmailClientMockup />);
    expect(screen.getByPlaceholderText(/Search emails/i)).toBeInTheDocument();
  });
});
