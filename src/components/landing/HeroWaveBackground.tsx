"use client";

import { useEffect, useId, useRef } from "react";

interface WaveOpts {
  baseY: number;
  amp: number;
  freq: number;
  waveCount: number;
  width: number;
  samples: number;
}

function buildWavePath(t: number, opts: WaveOpts): string {
  const { baseY, amp, freq, waveCount, width, samples } = opts;
  const k = (2 * Math.PI * waveCount) / width;
  const omega = 2 * Math.PI * freq;

  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const x = u * width;
    const primary = amp * Math.sin(k * x - omega * t);
    const wobble = amp * 0.22 * Math.sin(k * 0.6 * x - omega * 0.5 * t);
    const envelope = Math.sin(Math.PI * u);
    pts.push([x, baseY + (primary + wobble) * envelope]);
  }

  let d = `M ${pts[0]![0].toFixed(1)} ${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d +=
      ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},` +
      ` ${cp2x.toFixed(1)} ${cp2y.toFixed(1)},` +
      ` ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function HeroWaveBackground() {
  const idBase = useId().replace(/[:]/g, "");
  const gVert = `g-vert-${idBase}`;
  const fGrain = `f-grain-${idBase}`;
  const fBlurSoft = `f-blur-soft-${idBase}`;
  const fBlurMed = `f-blur-med-${idBase}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGPathElement>(null);
  const haloRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGPathElement>(null);

  const base: WaveOpts = {
    baseY: 320,
    amp: 200,
    freq: 0.04,
    waveCount: 2.6,
    width: 1920,
    samples: 36,
  };

  const initialD = buildWavePath(0, base);

  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
    if (reduced) return;

    let raf = 0;
    let lastFrame = 0;
    const minFrameDelta = 1000 / 30;

    let isVisible = true;
    let isTabActive =
      typeof document === "undefined" ? true : !document.hidden;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
      },
      { rootMargin: "120px" },
    );
    if (containerRef.current) io.observe(containerRef.current);

    const onVisibility = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const start = performance.now();
    const tick = (now: number) => {
      const shouldDraw =
        isVisible && isTabActive && now - lastFrame >= minFrameDelta;
      if (shouldDraw) {
        lastFrame = now;
        const t = (now - start) / 1000;
        const d = buildWavePath(t, base);
        ribbonRef.current?.setAttribute("d", d);
        haloRef.current?.setAttribute("d", d);
        spineRef.current?.setAttribute("d", d);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: "#ffffff",
        willChange: "transform",
        contain: "paint",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 640"
        preserveAspectRatio="xMidYMid slice"
        style={{
          minHeight: 640,
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 50%, #000 35%, transparent 100%)",
        }}
      >
        <defs>
          <linearGradient
            id={gVert}
            x1="0"
            y1="120"
            x2="0"
            y2="540"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#f4c969" />
            <stop offset="0.35" stopColor="#f9e0a8" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="0.65" stopColor="#a4c5ff" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>

          <filter id={fGrain} x="-2%" y="-30%" width="104%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.95"
              numOctaves="2"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.75 0"
              result="white-noise"
            />
            <feComposite
              in="white-noise"
              in2="SourceGraphic"
              operator="in"
              result="grained"
            />
            <feBlend in="SourceGraphic" in2="grained" mode="screen" />
          </filter>

          <filter id={fBlurSoft} x="-2%" y="-50%" width="104%" height="200%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id={fBlurMed} x="-2%" y="-50%" width="104%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <g>
          <path
            ref={haloRef}
            d={initialD}
            stroke={`url(#${gVert})`}
            strokeWidth="180"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
            filter={`url(#${fBlurSoft})`}
          />

          <path
            ref={ribbonRef}
            d={initialD}
            stroke={`url(#${gVert})`}
            strokeWidth="110"
            strokeLinecap="round"
            fill="none"
            opacity="0.92"
            filter={`url(#${fBlurMed})`}
          />

          <path
            ref={spineRef}
            d={initialD}
            stroke={`url(#${gVert})`}
            strokeWidth="56"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
            filter={`url(#${fGrain})`}
          />
        </g>
      </svg>
    </div>
  );
}
