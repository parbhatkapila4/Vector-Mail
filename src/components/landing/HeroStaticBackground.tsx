"use client";

const GRAIN_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" seed="9"/>
        <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 0.5 0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#n)" opacity="0.34"/>
    </svg>`,
  );

export function HeroStaticBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 85% 65% at 50% -8%, #ffe8b8 0%, #fbf2d5 30%, #fbf6e8 65%, #fbf6e8 100%)",
        contain: "paint",
        transform: "translateZ(0)",
        willChange: "auto",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ transform: "translateZ(0)" }}
      >
        <defs>
          <radialGradient
            id="vm-hero-navy"
            cx="32%"
            cy="58%"
            r="78%"
            fx="22%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#3a4f80" />
            <stop offset="50%" stopColor="#1e2a4a" />
            <stop offset="100%" stopColor="#0d1530" />
          </radialGradient>

          <radialGradient
            id="vm-hero-amber"
            cx="68%"
            cy="38%"
            r="78%"
            fx="78%"
            fy="44%"
          >
            <stop offset="0%" stopColor="#d8a05a" />
            <stop offset="50%" stopColor="#b88a3f" />
            <stop offset="100%" stopColor="#7d5c24" />
          </radialGradient>
        </defs>

        <path
          d="M 1760 -200
             C 1480 -220, 1180 -100, 980 120
             C 860 250, 870 420, 1010 540
             C 1150 660, 1380 700, 1580 640
             C 1780 580, 1900 420, 1900 240
             C 1900 80, 1880 -80, 1820 -160
             C 1800 -185, 1782 -198, 1760 -200 Z"
          fill="url(#vm-hero-navy)"
        />

        <path
          d="M -200 1100
             C 100 1090, 380 1020, 540 880
             C 670 760, 700 580, 580 460
             C 460 340, 240 320, 60 420
             C -120 520, -240 720, -280 940
             C -290 1010, -270 1095, -200 1100 Z"
          fill="url(#vm-hero-amber)"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${GRAIN_DATA_URI}")`,
          backgroundSize: "220px 220px",
          backgroundRepeat: "repeat",
          opacity: 0.55,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[220px]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, #fbf6e8 90%)",
        }}
      />
    </div>
  );
}

export default HeroStaticBackground;
