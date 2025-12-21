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
import { useRouter } from "next/navigation";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
    comingSoon?: boolean;
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const [, setTab] = useLocalStorage("vector-mail", "inbox");
  const isMobile = useIsMobile();
  const router = useRouter();

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
                  onClick={() => {
                    if (link.title === "AI Buddy") {
                      router.push("/buddy?fresh=true");
                    } else {
                      setTab(link.title.toLowerCase());
                    }
                  }}
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
                        ? "text-orange-500"
                        : link.title === "Inbox"
                          ? "text-blue-500"
                          : link.title === "AI Buddy"
                            ? "text-amber-500"
                            : link.title === "Sent"
                              ? "text-green-500"
                              : "text-purple-500",
                    )}
                  />
                  <span className="sr-only">{link.title}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {link.title}
                  {link.comingSoon && (
                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                      Coming soon
                    </span>
                  )}
                </div>
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
              onClick={() => {
                if (link.title === "AI Buddy") {
                  router.push("/buddy?fresh=true");
                } else {
                  setTab(link.title.toLowerCase());
                }
              }}
              className={cn(
                buttonVariants({
                  variant: link.variant,
                  size: isMobile ? "lg" : "sm",
                }),
                link.variant === "default" &&
                  "border-orange-500/30 bg-orange-500/20 text-white hover:bg-orange-500/30",
                link.variant === "ghost" && "text-white hover:bg-slate-800",
                "cursor-pointer justify-start",
                isMobile && "h-12 text-base",
              )}
            >
              <link.icon
                className={cn(
                  "mr-2 h-4 w-4",
                  isMobile && "h-5 w-5",
                  link.variant === "default"
                    ? "text-orange-500"
                    : link.title === "Inbox"
                      ? "text-blue-500"
                      : link.title === "AI Buddy"
                        ? "text-amber-500"
                        : link.title === "Sent"
                          ? "text-green-500"
                          : "text-purple-500",
                )}
              />
              <div className="flex items-center gap-2">
                <span className="text-white">{link.title}</span>
                {link.comingSoon && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                    Coming soon
                  </span>
                )}
              </div>
              {link.label && (
                <span className="ml-auto font-medium text-white">
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
