"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      position="bottom-right"
      offset="80px"
      gap={24}
      richColors
      expand={true}
      visibleToasts={5}
      toastOptions={{
        style: {
          zIndex: 99999,
          marginRight: "0px",
          marginBottom: "4px",
          color: "#000000",
          background: "#ffffff",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        className: "toast-black-text",
        classNames: {
          toast: "toast-black-text",
          title: "toast-black-text",
          description: "toast-black-text",
          actionButton: "toast-black-text",
          cancelButton: "toast-black-text",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
