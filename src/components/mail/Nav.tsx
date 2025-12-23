"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const getIconColor = (link: NavProps["links"][0]) => {
    if (link.variant === "default") return "text-amber-500";
    switch (link.title) {
      case "Inbox":
        return "text-blue-400";
      case "Sent":
        return "text-emerald-400";
      case "AI Buddy":
        return "text-violet-400";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex flex-col gap-1 py-2 data-[collapsed=true]:py-2",
        isMobile && "gap-1",
      )}
    >
      <nav
        className={cn(
          "grid gap-1 px-3 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2",
          isMobile && "gap-1 px-4",
        )}
      >
        {links.map((link, index) =>
          isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (link.title === "AI Buddy") {
                      router.push("/buddy?fresh=true");
                    } else {
                      setTab(link.title.toLowerCase());
                    }
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                    link.variant === "default"
                      ? "bg-amber-500/10 ring-1 ring-amber-500/20"
                      : "hover:bg-white/[0.04]",
                  )}
                >
                  <link.icon className={cn("h-5 w-5", getIconColor(link))} />
                  <span className="sr-only">{link.title}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="flex items-center gap-3 border-white/[0.08] bg-[#1A1A1A] px-3 py-2 text-white"
              >
                <span className="text-sm font-medium">{link.title}</span>
                {link.comingSoon && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    Soon
                  </span>
                )}
                {link.label && (
                  <span className="ml-auto text-xs text-zinc-400">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              key={index}
              onClick={() => {
                if (link.title === "AI Buddy") {
                  router.push("/buddy?fresh=true");
                } else {
                  setTab(link.title.toLowerCase());
                }
              }}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                link.variant === "default"
                  ? "bg-amber-500/10 ring-1 ring-amber-500/20"
                  : "hover:bg-white/[0.04]",
                isMobile && "py-3",
              )}
            >
              <link.icon
                className={cn("h-5 w-5 shrink-0", getIconColor(link))}
              />

              <div className="flex min-w-0 flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      link.variant === "default"
                        ? "text-white"
                        : "text-zinc-300",
                    )}
                  >
                    {link.title}
                  </span>
                  {link.comingSoon && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                      Soon
                    </span>
                  )}
                </div>

                {link.label && (
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      link.variant === "default"
                        ? "text-amber-400"
                        : "text-zinc-500",
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </div>
            </button>
          ),
        )}
      </nav>
    </div>
  );
}
