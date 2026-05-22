"use client";

import { useEffect } from "react";

export function useHeroReactiveBackground() {
  useEffect(() => {
    const docEl = document.documentElement;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMouseInside = false;

    const flowSvgs = document.querySelectorAll(".vm-flow-bg svg");
    const warpBundles = Array.from(flowSvgs).map((svg) => {
      const paths = svg.querySelectorAll("path");
      const originalDs = Array.from(paths).map((p) => p.getAttribute("d"));
      return { svg, paths, originalDs };
    });

    const resetPathsToOriginal = () => {
      for (const { paths, originalDs } of warpBundles) {
        paths.forEach((path, i) => {
          const o = originalDs[i];
          if (o) path.setAttribute("d", o);
        });
      }
    };

    let warpRafScheduled = false;
    let scrollWarpLocked = false;
    let scrollUnlockTimer: ReturnType<typeof setTimeout> | undefined;

    const runWarp = () => {
      if (scrollWarpLocked) return;
      for (const { svg, paths, originalDs } of warpBundles) {
        const rect = svg.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

        const localX = ((mouseX - rect.left) / rect.width) * 1440;
        const localY = ((mouseY - rect.top) / rect.height) * 900;

        paths.forEach((path, i) => {
          const original = originalDs[i];
          if (!original) return;
          const warped = original.replace(
            /(C|,)\s?(-?\d+(?:\.\d+)?)[,\s](-?\d+(?:\.\d+)?)/g,
            (match, prefix, xStr, yStr) => {
              const x = parseFloat(xStr);
              const y = parseFloat(yStr);
              const dx = x - localX;
              const dy = y - localY;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const strength = Math.max(0, 1 - dist / 400) * 35;
              const newX = x - (dx / dist) * strength * (isMouseInside ? 1 : 0);
              const newY = y - (dy / dist) * strength * (isMouseInside ? 1 : 0);
              return `${prefix}${newX.toFixed(1)},${newY.toFixed(1)}`;
            },
          );
          path.setAttribute("d", warped);
        });
      }
    };

    const scheduleWarp = () => {
      if (scrollWarpLocked) return;
      if (warpRafScheduled) return;
      warpRafScheduled = true;
      requestAnimationFrame(() => {
        warpRafScheduled = false;
        runWarp();
      });
    };

    let lastScrollY = window.scrollY;
    let scrollSettleTimer: ReturnType<typeof setTimeout> | undefined;
    let scrollVisualTimer: ReturnType<typeof setTimeout> | undefined;
    let scrollRafId = 0;
    let scrollRafPending = false;

    const flushScrollSideEffects = () => {
      scrollWarpLocked = true;
      docEl.classList.add("vm-scroll-active");
      clearTimeout(scrollUnlockTimer);
      scrollUnlockTimer = setTimeout(() => {
        scrollWarpLocked = false;
        scheduleWarp();
      }, 120);
      clearTimeout(scrollVisualTimer);
      scrollVisualTimer = setTimeout(() => {
        docEl.classList.remove("vm-scroll-active");
      }, 160);

      const velocity = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;

      if (velocity > 8) {
        document.documentElement.style.setProperty("--flow-opacity", "0.55");
      }

      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(() => {
        document.documentElement.style.setProperty("--flow-opacity", "1");
      }, 200);
    };

    const onScroll = () => {
      if (scrollRafPending) return;
      scrollRafPending = true;
      scrollRafId = requestAnimationFrame(() => {
        scrollRafPending = false;
        scrollRafId = 0;
        flushScrollSideEffects();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const trailContainer = document.createElement("div");
    trailContainer.className = "vm-cursor-trail";
    trailContainer.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:1;contain:strict;";
    document.body.appendChild(trailContainer);

    let lastTrailTime = 0;
    let lastWarpSampleX = mouseX;
    let lastWarpSampleY = mouseY;

    const heroRoot = document.querySelector(".vm-bg-container");
    let heroActive = true;
    if (heroRoot) {
      const r = heroRoot.getBoundingClientRect();
      heroActive = r.bottom > 0 && r.top < window.innerHeight;
    }

    const io =
      heroRoot &&
      new IntersectionObserver(
        ([e]) => {
          if (!e) return;
          const vis = e.isIntersecting && e.intersectionRatio > 0;
          if (vis === heroActive) return;
          heroActive = vis;
          if (!heroActive) {
            resetPathsToOriginal();
          } else {
            scheduleWarp();
          }
        },
        { root: null, threshold: [0, 0.02, 0.05] },
      );
    if (heroRoot && io) io.observe(heroRoot);

    const onMouseLeave = () => {
      isMouseInside = false;
    };

    const onPointerMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!heroActive) return;

      isMouseInside = true;

      const wdx = mouseX - lastWarpSampleX;
      const wdy = mouseY - lastWarpSampleY;
      if (wdx * wdx + wdy * wdy > 4) {
        lastWarpSampleX = mouseX;
        lastWarpSampleY = mouseY;
        scheduleWarp();
      }

      const now = performance.now();
      if (scrollWarpLocked) return;
      if (now - lastTrailTime < 60) return;
      lastTrailTime = now;

      const dot = document.createElement("div");
      dot.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(55,48,163,0.5);
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: opacity 0.8s ease, transform 0.8s ease;
    `;
      trailContainer.appendChild(dot);

      requestAnimationFrame(() => {
        dot.style.opacity = "0";
        dot.style.transform = "translate(-50%, -50%) scale(2.5)";
      });

      setTimeout(() => dot.remove(), 800);
    };

    document.addEventListener("mousemove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      io?.disconnect();
      cancelAnimationFrame(scrollRafId);
      document.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollSettleTimer);
      clearTimeout(scrollUnlockTimer);
      clearTimeout(scrollVisualTimer);
      docEl.classList.remove("vm-scroll-active");
      document.documentElement.style.removeProperty("--flow-opacity");
      trailContainer.remove();
    };
  }, []);
}
