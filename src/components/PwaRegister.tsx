"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    window.navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        console.debug("[PWA] Service worker registered", reg.scope);
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed", err);
      });
  }, []);
  return null;
}
