"use client";

export function HeroReactiveBackground() {
  return (
    <>
      <div className="ribbon-bg" aria-hidden>
        <svg viewBox="0 0 1600 800" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vmHeroGoldBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.95" />
              <stop offset="20%" stopColor="#f5d990" stopOpacity="1" />
              <stop offset="50%" stopColor="#e9bd6e" stopOpacity="1" />
              <stop offset="80%" stopColor="#c89548" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8e571f" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="vmHeroGoldUnder" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8e571f" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#a07a3e" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#d4a55b" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="vmHeroIndigoBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dde2ff" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#a5a8f5" stopOpacity="1" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="80%" stopColor="#3730a3" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1e1b6b" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="vmHeroIndigoUnder" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e1b6b" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#3730a3" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="vmHeroTransition" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e9bd6e" stopOpacity="0.95" />
              <stop offset="20%" stopColor="#d4b099" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#c4a8c8" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#a89cd6" stopOpacity="0.95" />
              <stop offset="80%" stopColor="#7c79c9" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="vmHeroTopGleam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff8e0" stopOpacity="0" />
              <stop offset="20%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#fffaeb" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#e8e3ff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="vmHeroBackdrop" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#f0d590" stopOpacity="0" />
              <stop offset="20%" stopColor="#f0d590" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#c4a8c8" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3730a3" stopOpacity="0" />
            </linearGradient>

            <filter id="vmHeroSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            </filter>
            <filter id="vmHeroHeavyBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
            </filter>
            <filter id="vmHeroSilkBlur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>
          </defs>

          <g className="layer-back">
            <ellipse cx="400" cy="560" rx="500" ry="180" fill="#f0d590" opacity="0.35" filter="url(#vmHeroHeavyBlur)" />
            <ellipse cx="900" cy="540" rx="400" ry="160" fill="#c4a8c8" opacity="0.30" filter="url(#vmHeroHeavyBlur)" />
            <ellipse cx="1300" cy="560" rx="450" ry="170" fill="#6366f1" opacity="0.32" filter="url(#vmHeroHeavyBlur)" />
          </g>

          <g className="layer-main">
            <path d="M 120,520 C 280,460 380,540 520,510 C 580,498 620,490 660,500 C 700,510 720,540 700,580 C 680,620 600,640 480,640 C 380,640 240,620 120,580 Z"
              fill="url(#vmHeroGoldUnder)" opacity="0.85" />
            <path d="M -80,540 C 120,440 280,400 480,420 C 580,430 660,460 700,500 C 720,520 720,560 700,580 C 680,600 600,610 480,600 C 320,590 160,570 -80,580 Z"
              fill="url(#vmHeroGoldBody)" opacity="0.95" />
            <path d="M -80,540 C 120,440 280,400 480,420 C 580,430 660,460 700,500"
              fill="none" stroke="url(#vmHeroTopGleam)" strokeWidth="3" opacity="0.95" filter="url(#vmHeroSilkBlur)" />
            <path d="M -80,540 C 120,440 280,400 480,420 C 580,430 660,460 700,500"
              fill="none" stroke="#fff8e0" strokeWidth="1" opacity="0.7" />
            <path d="M 200,500 C 320,480 440,490 560,510 C 600,518 620,530 600,545 C 540,560 360,555 200,535 Z"
              fill="#a07a3e" opacity="0.25" />
          </g>

          <g className="layer-fore">
            <path d="M 660,490 C 720,500 780,510 840,510 C 900,510 960,500 1020,490 C 1040,500 1050,520 1030,540 C 970,555 900,560 840,558 C 780,558 720,555 660,545 C 640,525 640,505 660,490 Z"
              fill="url(#vmHeroTransition)" opacity="0.95" />
            <path d="M 680,498 C 750,505 850,510 1000,500"
              fill="none" stroke="#fffaeb" strokeWidth="2" opacity="0.8" filter="url(#vmHeroSilkBlur)" />
            <path d="M 680,498 C 750,505 850,510 1000,500"
              fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
            <path d="M 700,538 C 800,550 900,552 1000,540"
              fill="none" stroke="#5a3a8a" strokeWidth="1.5" opacity="0.5" />
          </g>

          <g className="layer-main">
            <path d="M 980,510 C 1100,500 1180,490 1280,500 C 1380,510 1500,530 1620,540 C 1700,545 1700,580 1620,600 C 1500,620 1380,625 1280,615 C 1180,605 1100,580 980,560 C 960,540 960,520 980,510 Z"
              fill="url(#vmHeroIndigoUnder)" opacity="0.85" />
            <path d="M 980,500 C 1100,460 1240,420 1400,420 C 1540,420 1680,440 1700,460 L 1700,580 C 1620,600 1480,610 1340,600 C 1200,590 1080,570 980,560 C 960,545 960,520 980,500 Z"
              fill="url(#vmHeroIndigoBody)" opacity="0.95" />
            <path d="M 980,500 C 1100,460 1240,420 1400,420 C 1540,420 1680,440 1700,460"
              fill="none" stroke="url(#vmHeroTopGleam)" strokeWidth="3" opacity="0.95" filter="url(#vmHeroSilkBlur)" />
            <path d="M 980,500 C 1100,460 1240,420 1400,420 C 1540,420 1680,440 1700,460"
              fill="none" stroke="#e8e3ff" strokeWidth="1" opacity="0.7" />
            <path d="M 1080,490 C 1200,475 1320,470 1440,475 C 1500,478 1540,490 1520,505 C 1440,520 1280,520 1080,510 Z"
              fill="#1e1b6b" opacity="0.22" />
          </g>

          <g className="layer-back">
            <path d="M -80,650 C 200,610 400,680 720,640 C 1020,605 1240,680 1500,640 L 1700,640 L 1700,800 L -80,800 Z"
              fill="url(#vmHeroBackdrop)" opacity="0.55" />
            <path d="M -80,650 C 200,610 400,680 720,640 C 1020,605 1240,680 1500,640"
              fill="none" stroke="url(#vmHeroTopGleam)" strokeWidth="1.2" opacity="0.4" />
          </g>

          <g className="layer-fore">
            <path d="M -80,720 C 280,680 480,750 760,710 C 1060,665 1280,740 1550,690 L 1700,690 L 1700,800 L -80,800 Z"
              fill="url(#vmHeroBackdrop)" opacity="0.35" />
            <path d="M -80,760 C 350,725 500,775 800,745 C 1100,715 1350,765 1620,725 L 1700,725 L 1700,800 L -80,800 Z"
              fill="url(#vmHeroBackdrop)" opacity="0.22" />
          </g>
        </svg>
      </div>

      <div className="particles" aria-hidden>
        <span className="particle" />
        <span className="particle pearl" />
        <span className="particle indigo" />
        <span className="particle" />
        <span className="particle pearl" />
        <span className="particle" />
        <span className="particle indigo" />
        <span className="particle pearl" />
        <span className="particle" />
        <span className="particle indigo" />
        <span className="particle pearl" />
        <span className="particle" />
        <span className="particle pearl" />
        <span className="particle indigo" />
        <span className="particle" />
        <span className="particle pearl" />
        <span className="particle indigo" />
        <span className="particle" />
      </div>
    </>
  );
}
