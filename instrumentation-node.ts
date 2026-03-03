if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason: unknown) => {
    const message =
      reason instanceof Error ? reason.message : String(reason ?? "");
    const isHmrPing =
      typeof message === "string" &&
      message.includes("unrecognized HMR message") &&
      message.includes("ping");
    if (isHmrPing) return;
    console.error("[instrumentation] Unhandled Rejection:", reason);

  });

  if (process.env.NODE_ENV === "development") {
    process.on("uncaughtException", (err: Error) => {
      console.error("[instrumentation] Uncaught Exception (server kept alive in dev):", err);


    });
  }
}
