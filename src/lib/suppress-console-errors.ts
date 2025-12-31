if (typeof window !== "undefined") {
  const originalError = console.error;

  console.error = (...args: unknown[]) => {
    const errorString = String(args[0] || "");

    if (
      errorString.includes("query #") &&
      (errorString.includes("account.getAccounts") ||
        errorString.includes("account.getMyAccount") ||
        errorString.includes("account.getNumThreads") ||
        errorString.includes("account.getThreads"))
    ) {
      return;
    }

    if (errorString.includes("UNAUTHORIZED")) {
      return;
    }

    originalError.apply(console, args);
  };
}
