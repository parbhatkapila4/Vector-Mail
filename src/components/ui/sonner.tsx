"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

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
