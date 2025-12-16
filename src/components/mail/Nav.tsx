"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "usehooks-ts";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const [, setTab] = useLocalStorage("vector-mail", "inbox");
  const isMobile = useIsMobile();

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2",
        isMobile && "gap-2",
      )}
    >
      <nav
        className={cn(
          "grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2",
          isMobile && "gap-2 px-4",
        )}
      >
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <span
                  onClick={() => setTab(link.title.toLowerCase())}
                  className={cn(
                    buttonVariants({ variant: link.variant, size: "icon" }),
                    "h-9 w-9 cursor-pointer",
                    link.variant === "default" &&
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white",
                  )}
                >
                  <link.icon
                    className={cn(
                      "h-4 w-4",
                      link.variant === "default"
                        ? "text-black dark:text-black"
                        : "text-white dark:text-white",
                    )}
                  />
                  <span className="sr-only">{link.title}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <span
              key={index}
              onClick={() => setTab(link.title.toLowerCase())}
              className={cn(
                buttonVariants({
                  variant: link.variant,
                  size: isMobile ? "lg" : "sm",
                }),
                link.variant === "default" &&
                  "border-purple-500/30 text-black dark:bg-gradient-to-r dark:from-purple-600/20 dark:via-purple-400/20 dark:to-amber-400/20 dark:text-black dark:hover:from-purple-600/30 dark:hover:via-purple-400/30 dark:hover:to-amber-400/30",
                link.variant === "ghost" && "text-white dark:text-white",
                "cursor-pointer justify-start",
                isMobile && "h-12 text-base",
              )}
            >
              <link.icon
                className={cn(
                  "mr-2 h-4 w-4",
                  isMobile && "h-5 w-5",
                  link.variant === "default"
                    ? "text-black dark:text-black"
                    : "text-white dark:text-white",
                )}
              />
              <span
                className={
                  link.variant === "default"
                    ? "text-black dark:text-black"
                    : "text-white dark:text-white"
                }
              >
                {link.title}
              </span>
              {link.label && (
                <span
                  className={cn(
                    "ml-auto font-medium",
                    link.variant === "default"
                      ? "text-black dark:text-black"
                      : "text-white dark:text-white",
                  )}
                >
                  {link.label}
                </span>
              )}
            </span>
          ),
        )}
      </nav>
    </div>
  );
}
