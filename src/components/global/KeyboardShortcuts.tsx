"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";


export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {

      const isTyping =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.isContentEditable;

      if (isTyping) return;


      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;


      const isNewChatShortcut = isMac
        ? event.metaKey && event.key.toLowerCase() === "n"
        : event.altKey && event.key.toLowerCase() === "n";

      if (isNewChatShortcut) {
        event.preventDefault();

        router.push("/buddy?fresh=true");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname]);

  return null;
}
