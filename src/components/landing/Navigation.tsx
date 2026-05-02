"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Menu, X, Loader2 } from "lucide-react";
import { useMailNavigation } from "@/components/mail-navigation-loader";

const NAV_LINKS: { label: string; href: string; chev?: boolean }[] = [
  { label: "Product", href: "/features", chev: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Use Cases", href: "/about", chev: true },
  { label: "Resources", href: "/brief", chev: true },
  { label: "Changelog", href: "/changelog" },
];

function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 30 30" fill="none" width={size} height={size}>
        <rect x="3" y="6" width="24" height="18" rx="3" fill="#0a0a0a" />
        <g
          stroke="#9d7af3"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 11l3 4-3 4" />
          <path d="M13 11l3 4-3 4" />
          <path d="M19 11l3 4-3 4" />
        </g>
      </svg>
    </span>
  );
}

function Chev() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className="transition-transform duration-200 group-hover:translate-y-[2px]"
    >
      <path
        d="M2 4l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowPill({ small }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-[5px] text-[#0a0a0a]"
      style={{
        width: small ? 22 : 22,
        height: small ? 22 : 22,
        background: "#9d7af3",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 6h6M6 3l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Navigation() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authFallbackReady, setAuthFallbackReady] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { navigateToMail, isNavigating } = useMailNavigation();
  const userLabel = user?.firstName || user?.fullName || "User";
  const userInitial = (userLabel.trim().charAt(0) || "U").toUpperCase();

  useEffect(() => {
    if (searchParams.get("signout") === "1") {
      router.replace("/", { scroll: false });
      if (signOut) void signOut();
    }
  }, [searchParams, signOut, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    router.prefetch("/mail");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded) {
      setAuthFallbackReady(false);
      return;
    }
    const t = window.setTimeout(() => setAuthFallbackReady(true), 1500);
    return () => window.clearTimeout(t);
  }, [isLoaded]);

  const canRenderAuthState = isLoaded || authFallbackReady;

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

  const handleLogout = () => {
    setAccountMenuOpen(false);
    void signOut({ redirectUrl: "/" });
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--vmx-line, #e5e0ee)",
      }}
    >
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link
          href="/"
          aria-label="VectorMail"
          className="flex shrink-0 items-center gap-[10px] leading-none transition-opacity hover:opacity-90"
          style={{
            color: "var(--vmx-ink, #0a0a0a)",
            fontFamily: "var(--vmx-sans)",
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          <BrandMark />
          VectorMail
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group inline-flex items-center gap-[6px] rounded-[6px] px-4 py-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150"
              style={{ color: "var(--vmx-ink-1, #1f1f1f)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--vmx-paper-3, #f3f1f7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              {item.label}
              {item.chev && <Chev />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!canRenderAuthState ? (
            <div className="hidden items-center gap-2 md:flex" aria-hidden>
              <div className="h-9 w-44 animate-pulse rounded-[8px] bg-[#efece5]" />
            </div>
          ) : isSignedIn ? (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={navigateToMail}
                disabled={isNavigating}
                className="inline-flex items-center gap-2 rounded-[8px] py-[10px] pl-[18px] pr-[14px] text-[14px] font-semibold text-white transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: "var(--vmx-ink, #0a0a0a)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.15)",
                  letterSpacing: "-0.005em",
                  fontFamily: "var(--vmx-sans)",
                }}
              >
                {isNavigating ? "Opening..." : "Open VectorMail"}
                {isNavigating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowPill />
                )}
              </button>
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-[8px] border border-[#e5e0ee] bg-white py-1 pl-1 pr-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#faf9fc]"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ede9fe] text-[12px] font-semibold text-[#4c1d95]">
                    {userInitial}
                  </span>
                  <span className="text-[13px] font-medium text-[#1f1f1f]">
                    {userLabel}
                  </span>
                </button>
                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[140px] rounded-[10px] border border-[#e5e0ee] bg-white p-1 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#991b1b] transition-colors hover:bg-[#fef2f2]"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[13.5px] font-medium text-[#4a4a4a] transition-colors duration-150 hover:bg-[#f3f1f7] hover:text-[#0a0a0a]"
                style={{ fontFamily: "var(--vmx-sans)" }}
              >
                Sign in
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-[8px] py-[10px] pl-[18px] pr-[14px] text-[14px] font-semibold text-white transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: "var(--vmx-ink, #0a0a0a)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.15)",
                  letterSpacing: "-0.005em",
                  fontFamily: "var(--vmx-sans)",
                }}
              >
                Get Started
                <ArrowPill />
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-[#4a4a4a] transition-colors hover:bg-[#f3f1f7] hover:text-[#0a0a0a] md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div
          className="border-t md:hidden"
          style={{
            borderColor: "var(--vmx-line, #e5e0ee)",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="mx-auto max-w-[1280px] space-y-0.5 px-5 py-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-md px-3.5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1f1f1f] transition-colors hover:bg-[#f3f1f7]"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[#e5e0ee]" />
            {!canRenderAuthState ? (
              <div className="h-10 animate-pulse rounded-[8px] bg-[#efece5]" />
            ) : isSignedIn ? (
              <div className="flex flex-col gap-2"> 
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateToMail();
                  }}
                  disabled={isNavigating}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] py-2.5 text-[13.5px] font-semibold text-white"
                  style={{
                    background: "var(--vmx-ink, #0a0a0a)",
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {isNavigating ? "Opening..." : "Open VectorMail"}
                  {isNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowPill />
                  )}
                </button>
                <div className="flex items-center gap-3 rounded-[8px] bg-white px-3 py-2.5 ring-1 ring-[#e5e0ee]">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ede9fe] text-[12px] font-semibold text-[#4c1d95]">
                    {userInitial}
                  </span>
                  <span className="text-[13.5px] font-medium text-[#0a0a0a]">
                    {userLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-[8px] px-3.5 py-2.5 text-center text-[13.5px] font-medium text-[#1f1f1f] transition-colors hover:bg-[#f3f1f7]"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-[8px] py-2.5 text-[13.5px] font-semibold text-white"
                  style={{
                    background: "var(--vmx-ink, #0a0a0a)",
                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  Get Started
                  <ArrowPill />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
