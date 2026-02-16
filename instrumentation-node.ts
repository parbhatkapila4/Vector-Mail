if (typeof process !== "undefined") {
  process.on("unhandledRejection", (reason: unknown) => {
    const message =
      reason instanceof Error ? reason.message : String(reason ?? "");
    const isHmrPing =
      typeof message === "string" &&
      message.includes("unrecognized HMR message") &&
      message.includes("ping");
    if (isHmrPing) return;
    console.error("Unhandled Rejection:", reason);
  });
}
