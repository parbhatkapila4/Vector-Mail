"use client";

import React, {
  createContext,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import { toast } from "sonner";
import { UNDO_SEND_DELAY_MS } from "@/lib/undo-send";

type ExecuteSend = () => Promise<void>;

interface PendingSendContextValue {
  scheduleSend: (execute: ExecuteSend) => void;
  cancelSend: () => void;
  isPending: boolean;
}

const PendingSendContext = createContext<PendingSendContextValue | null>(null);

export function PendingSendProvider({ children }: { children: React.ReactNode }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executeRef = useRef<ExecuteSend | null>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const [isPending, setIsPending] = useState(false);

  const cancelSend = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    executeRef.current = null;
    setIsPending(false);
    if (toastIdRef.current != null) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    toast.info("Send cancelled");
  }, []);

  const scheduleSend = useCallback(
    (execute: ExecuteSend) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      executeRef.current = execute;
      setIsPending(true);

      toast.dismiss("ai-generating");
      toast.dismiss("ai-thinking");
      toast.dismiss("ai-ready");

      const id = toast.success("Email sent", {
        description: "Undo within a few seconds",
        action: {
          label: "Undo",
          onClick: () => cancelSend(),
        },
        duration: UNDO_SEND_DELAY_MS + 2000,
        id: "undo-send",
      });
      toastIdRef.current = id;

      timerRef.current = setTimeout(async () => {
        timerRef.current = null;
        const fn = executeRef.current;
        executeRef.current = null;
        setIsPending(false);
        if (toastIdRef.current != null) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = null;
        }
        if (fn) {
          try {
            await fn();
          } catch {
          }
        }
      }, UNDO_SEND_DELAY_MS);
    },
    [cancelSend],
  );

  const value = useMemo<PendingSendContextValue>(
    () => ({ scheduleSend, cancelSend, isPending }),
    [scheduleSend, cancelSend, isPending],
  );

  return (
    <PendingSendContext.Provider value={value}>
      {children}
    </PendingSendContext.Provider>
  );
}

export function usePendingSend(): PendingSendContextValue {
  const ctx = React.useContext(PendingSendContext);
  if (!ctx) {
    throw new Error("usePendingSend must be used within PendingSendProvider");
  }
  return ctx;
}
