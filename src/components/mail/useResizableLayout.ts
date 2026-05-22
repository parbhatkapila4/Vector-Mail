"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ResizableLayoutOptions {
  sidebarWidthPct: number;
  setSidebarWidthPct: (next: number) => void;
  sidebarBoundsPct: { min: number; max: number };
  aiPanelWidthPx: number;
  setAiPanelWidthPx: (next: number) => void;
  aiPanelBoundsPx: { min: number; max: number };
  onAiPanelCommit?: () => void;
}

export function useResizableLayout({
  sidebarWidthPct,
  setSidebarWidthPct,
  sidebarBoundsPct,
  aiPanelWidthPx,
  setAiPanelWidthPx,
  aiPanelBoundsPx,
  onAiPanelCommit,
}: ResizableLayoutOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const [isAiResizing, setIsAiResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const resizeStartRef = useRef<{
    x: number;
    pct: number;
    finalPct: number;
  } | null>(null);
  const aiResizeStartRef = useRef<{
    x: number;
    widthPx: number;
    finalWidthPx: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const aiRafRef = useRef<number | null>(null);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        pct: sidebarWidthPct,
        finalPct: sidebarWidthPct,
      };
    },
    [sidebarWidthPct],
  );

  const handleAiResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      setIsAiResizing(true);
      aiResizeStartRef.current = {
        x: e.clientX,
        widthPx: aiPanelWidthPx,
        finalWidthPx: aiPanelWidthPx,
      };
    },
    [aiPanelWidthPx],
  );

  useEffect(() => {
    if (!isResizing) return;
    const pendingRef = { current: null as number | null };
    const flush = () => {
      rafRef.current = null;
      const x = pendingRef.current;
      pendingRef.current = null;
      if (x === null) return;
      const start = resizeStartRef.current;
      const el = containerRef.current;
      const sidebar = sidebarRef.current;
      if (!start || !el || !sidebar) return;
      const containerWidth = el.getBoundingClientRect().width;
      if (containerWidth <= 0) return;
      const deltaPct = ((x - start.x) / containerWidth) * 100;
      let next = start.pct + deltaPct;
      next = Math.max(
        sidebarBoundsPct.min,
        Math.min(sidebarBoundsPct.max, next),
      );
      resizeStartRef.current = { ...start, finalPct: next };
      sidebar.style.width = `${next}%`;
    };
    const onMove = (e: PointerEvent) => {
      pendingRef.current = e.clientX;
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
    };
    const onUp = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const start = resizeStartRef.current;
      if (start) setSidebarWidthPct(start.finalPct);
      resizeStartRef.current = null;
      setIsResizing(false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isResizing, setSidebarWidthPct, sidebarBoundsPct.min, sidebarBoundsPct.max]);

  useEffect(() => {
    if (!isAiResizing) return;
    const pendingRef = { current: null as number | null };
    const flush = () => {
      aiRafRef.current = null;
      const x = pendingRef.current;
      pendingRef.current = null;
      if (x === null) return;
      const start = aiResizeStartRef.current;
      if (!start) return;
      const delta = start.x - x;
      let next = start.widthPx + delta;
      next = Math.max(
        aiPanelBoundsPx.min,
        Math.min(aiPanelBoundsPx.max, next),
      );
      aiResizeStartRef.current = { ...start, finalWidthPx: next };
      setAiPanelWidthPx(next);
    };
    const onMove = (e: PointerEvent) => {
      pendingRef.current = e.clientX;
      if (aiRafRef.current === null) aiRafRef.current = requestAnimationFrame(flush);
    };
    const onUp = () => {
      if (aiRafRef.current !== null) {
        cancelAnimationFrame(aiRafRef.current);
        aiRafRef.current = null;
      }
      const start = aiResizeStartRef.current;
      if (start) {
        const widthChanged = Math.abs(start.finalWidthPx - start.widthPx) >= 1;
        setAiPanelWidthPx(start.finalWidthPx);
        if (widthChanged) onAiPanelCommit?.();
      }
      aiResizeStartRef.current = null;
      setIsAiResizing(false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (aiRafRef.current !== null) cancelAnimationFrame(aiRafRef.current);
    };
  }, [
    isAiResizing,
    setAiPanelWidthPx,
    aiPanelBoundsPx.min,
    aiPanelBoundsPx.max,
    onAiPanelCommit,
  ]);

  return {
    containerRef,
    sidebarRef,
    isResizing,
    isAiResizing,
    handleResizeStart,
    handleAiResizeStart,
  };
}
