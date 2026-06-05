"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const toastIcons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M12 7.6v5.2" />
      <path d="M12 16.4h.01" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M12 11v5" />
      <path d="M12 7.9h.01" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeWidth="1.8" />
      <path d="M12 9.5v4" />
      <path d="M12 17.2h.01" />
    </svg>
  ),
  loading: (
    <svg viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.4" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  ),
};

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  const theme: ToasterProps["theme"] =
    resolvedTheme === "light" ? "light" : "dark";

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      offset={{ bottom: 24, right: 20 }}
      mobileOffset={{ bottom: 16, right: 12, left: 12 }}
      gap={6}
      expand={false}
      visibleToasts={3}
      closeButton={false}
      duration={4000}
      icons={toastIcons}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "vm-toast",
          title: "vm-toast-title",
          description: "vm-toast-desc",
          icon: "vm-toast-icon",
          content: "vm-toast-content",
          actionButton: "vm-toast-action",
          cancelButton: "vm-toast-cancel",
          success: "vm-toast--success",
          error: "vm-toast--error",
          info: "vm-toast--info",
          warning: "vm-toast--warning",
          loading: "vm-toast--loading",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
