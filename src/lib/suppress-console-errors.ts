// Suppress UNAUTHORIZED tRPC errors in console
// These are expected when user is not logged in or authentication is being established

if (typeof window !== "undefined") {
  const originalError = console.error;
  
  console.error = (...args: unknown[]) => {
    // Check if this is a tRPC query error
    const errorString = String(args[0] || "");
    
    // Suppress tRPC query errors that match the pattern: [[ << query #X ]account.XXX {}
    // These are often UNAUTHORIZED errors that are expected during initial load
    if (
      errorString.includes("query #") &&
      (errorString.includes("account.getAccounts") ||
        errorString.includes("account.getMyAccount") ||
        errorString.includes("account.getNumThreads") ||
        errorString.includes("account.getThreads"))
    ) {
      // Suppress this error - it's likely an UNAUTHORIZED error during auth initialization
      return;
    }
    
    // Also suppress explicit UNAUTHORIZED errors
    if (errorString.includes("UNAUTHORIZED")) {
      return;
    }
    
    // Log other errors normally
    originalError.apply(console, args);
  };
}

