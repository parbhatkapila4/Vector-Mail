"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Mail,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Plus,
  Star,
  Send,
  Archive,
  AlertTriangle,
  Trash,
  MoreHorizontal,
  Reply,
  Forward,
  Paperclip,
  ChevronDown,
  Zap,
  User,
  Clock,
} from "lucide-react";

export function EmailClientMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 text-sm font-bold text-white shadow-lg shadow-orange-500/50">
            V
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
            W
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/30 bg-green-500/20 text-green-400 transition-colors hover:bg-green-500/30">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-4 max-w-md flex-1">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
            <Search className="h-4 w-4 text-blue-500" />
            <input
              type="text"
              placeholder="Search emails..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/20 text-orange-400 transition-colors hover:bg-orange-500/30">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0a0a0a] bg-red-500" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/20 text-blue-400 transition-colors hover:bg-blue-500/30">
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full border-2 border-slate-800 bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500" />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex h-[600px]">
        <div className="flex w-56 flex-col border-r border-slate-800 bg-slate-900/30">
          <div className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 font-bold text-white shadow-lg shadow-orange-500/50">
                V
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  VectorMail
                </div>
                <div className="truncate text-xs text-slate-400">
                  work@vectormail.ai
                </div>
              </div>
            </div>

            <button className="mb-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/50 transition-colors hover:opacity-90">
              <Mail className="h-4 w-4" />
              <span>New email</span>
            </button>

            <div className="space-y-1">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Core
              </div>
              <NavItem
                icon={Mail}
                label="Inbox"
                count="281"
                active
                color="purple"
              />
              <NavItem icon={Star} label="Favorites" color="yellow" />
              <NavItem icon={Clock} label="AI Buddy" count="13" color="blue" />
              <NavItem icon={Send} label="Sent" color="emerald" />
              <NavItem icon={Archive} label="Archive" color="indigo" />
              <NavItem
                icon={AlertTriangle}
                label="Spam"
                count="24"
                color="red"
              />
              <NavItem icon={Trash} label="Bin" color="gray" />
            </div>
          </div>

          <div className="mt-auto space-y-1 border-t border-slate-800 p-4">
            <NavItem icon={Settings} label="Settings" color="gray" />
            <NavItem icon={HelpCircle} label="Support" color="blue" />
          </div>
        </div>

        <div className="flex w-80 flex-col border-r border-slate-800 bg-[#0a0a0a]">
          <div className="border-b border-slate-800 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Inbox
              </h2>
              <button className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
                ✓ Select
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
              <Search className="h-4 w-4 text-blue-500" />
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                readOnly
              />
              <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-xs text-slate-400">
                ⌘K
              </span>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20">
                <Zap className="h-4 w-4 text-yellow-400" />
                Primary
              </button>
              <button className="rounded-lg border border-red-500/30 bg-red-500/20 p-2 transition-colors hover:bg-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </button>
              <button className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-2 transition-colors hover:bg-blue-500/30">
                <User className="h-4 w-4 text-blue-400" />
              </button>
              <button className="rounded-lg border border-green-500/30 bg-green-500/20 p-2 transition-colors hover:bg-green-500/30">
                <Bell className="h-4 w-4 text-green-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Pinned
                </span>
                <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-xs text-slate-400">
                  3
                </span>
              </div>

              <EmailItem
                sender="VectorMail Team"
                subject="New AI features launched"
                time="Mar 29"
                count="9"
                avatarColor="from-purple-600 via-purple-400 to-amber-400"
                badges={[
                  { icon: User, color: "text-blue-400", bg: "bg-blue-500/20" },
                  {
                    icon: Bell,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/20",
                  },
                ]}
                active
              />
              <EmailItem
                sender="David, Emma, Mike"
                subject="Re: Product roadmap discussion"
                time="Mar 28"
                count="6"
                avatarColor="from-blue-500 to-cyan-500"
                badges={[
                  {
                    icon: User,
                    color: "text-purple-400",
                    bg: "bg-purple-500/20",
                  },
                  {
                    icon: User,
                    color: "text-amber-400",
                    bg: "bg-amber-500/20",
                  },
                  {
                    icon: Bell,
                    color: "text-yellow-400",
                    bg: "bg-yellow-500/20",
                  },
                ]}
              />
              <EmailItem
                sender="Security Alerts"
                subject="Weekly security digest"
                time="Mar 28"
                count="8"
                avatarColor="from-orange-500 to-red-500"
                badges={[
                  {
                    icon: AlertTriangle,
                    color: "text-red-400",
                    bg: "bg-red-500/20",
                  },
                  { icon: User, color: "text-blue-400", bg: "bg-blue-500/20" },
                ]}
              />
            </div>

            <div className="px-4 pb-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Primary
                </span>
                <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-xs text-slate-400">
                  278
                </span>
              </div>

              <EmailItem
                sender="Finance Team"
                subject="Monthly expense report ready"
                time="Mar 29"
                avatarColor="from-violet-500 to-purple-600"
                badges={[
                  {
                    icon: AlertTriangle,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/20",
                  },
                  { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/20" },
                ]}
                logo="F"
              />
              <EmailItem
                sender="Marketing"
                subject="Q1 campaign performance update"
                time="Mar 29"
                avatarColor="from-red-600 to-rose-700"
                badges={[
                  {
                    icon: Bell,
                    color: "text-amber-400",
                    bg: "bg-amber-500/20",
                  },
                ]}
                logo="M"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col bg-[#0a0a0a]">
          <div className="border-b border-slate-800 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-white">
                  Re: VectorMail v2.0 roadmap
                  <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-sm text-slate-400">
                    6
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>March 25 - March 29</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-2 text-sm text-white transition-colors hover:bg-orange-500/30">
                  <Reply className="h-4 w-4" />
                  Reply all
                </button>
                <button className="rounded-lg border border-yellow-500/30 bg-yellow-500/20 p-2 text-yellow-400 transition-colors hover:bg-yellow-500/30">
                  <Star className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-red-500/30 bg-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/30">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {[
                {
                  name: "David",
                  color: "from-purple-600 via-purple-400 to-amber-400",
                },
                { name: "Emma", color: "from-blue-500 to-cyan-500" },
                { name: "Mike", color: "from-emerald-500 to-green-500" },
              ].map((person, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 bg-gradient-to-br ${person.color} flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg`}
                  >
                    {person.name[0]}
                  </div>
                  <span className="text-sm text-slate-300">{person.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 shadow-lg shadow-orange-500/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">
                    AI Summary
                  </span>
                  <span className="rounded-full border border-orange-500/50 bg-orange-500/30 px-2 py-0.5 text-xs text-orange-300">
                    New
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-orange-400" />
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                VectorMail v2.0 product roadmap discussion. Team reviewed
                AI-powered features, semantic search improvements, and inbox
                management tools. Positive feedback on the new dashboard design
                and keyboard shortcuts implementation.
              </p>
            </motion.div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-semibold text-white">
                    Attachments
                  </span>
                  <span className="rounded border border-slate-800 bg-slate-900/50 px-2 py-0.5 text-xs text-slate-400">
                    4
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    name: "dashboard-mockup.fig",
                    size: "21 MB",
                    color: "from-purple-600 via-purple-400 to-amber-400",
                  },
                  {
                    name: "product-roadmap.docx",
                    size: "3.7 MB",
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    name: "ui-screenshot.png",
                    size: "2.3 MB",
                    color: "from-emerald-500 to-green-500",
                  },
                  {
                    name: "tech-specs.pdf",
                    size: "1.5 MB",
                    color: "from-orange-500 to-red-500",
                  },
                ].map((file, i) => (
                  <div
                    key={i}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2 transition-colors hover:bg-slate-800"
                  >
                    <div
                      className={`h-8 w-8 bg-gradient-to-br ${file.color} flex items-center justify-center rounded-lg shadow-lg`}
                    >
                      <Paperclip className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-white">
                        {file.name}
                      </div>
                      <div className="text-xs text-slate-400">{file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-500 font-bold text-white shadow-lg shadow-orange-500/50">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        David Chen
                      </span>
                      <span className="text-xs text-slate-400">
                        March 25, 10:15 AM
                      </span>
                    </div>
                    <div className="mb-3 text-xs text-slate-400">
                      To: Emma, Mike
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Hey team! Just pushed the latest VectorMail dashboard
                      updates. The new semantic search is lightning fast and the
                      AI summaries are incredibly accurate. Ready for your
                      review - let me know what you think!
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-orange-500/30">
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500/30">
                    <Forward className="h-3 w-3" />
                    Forward
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 font-bold text-white shadow-lg shadow-green-500/50">
                    E
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Emma Rodriguez
                      </span>
                      <span className="text-xs text-slate-400">
                        March 25, 2:30 PM
                      </span>
                    </div>
                    <div className="mb-3 text-xs text-slate-400">To: David</div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Tested the new features thoroughly and I'm impressed! The
                      keyboard shortcuts are incredibly intuitive and the
                      AI-powered responses save so much time. This is exactly
                      what power users need. Ready to ship! 🚀
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-green-500/30">
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-500/30">
                    <Forward className="h-3 w-3" />
                    Forward
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  count,
  active,
  color,
}: {
  icon: LucideIcon;
  label: string;
  count?: string;
  active?: boolean;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    purple: "text-orange-500",
    yellow: "text-yellow-400",
    blue: "text-blue-500",
    emerald: "text-green-500",
    indigo: "text-indigo-400",
    red: "text-red-400",
    gray: "text-slate-400",
  };

  const bgColorMap: Record<string, string> = {
    purple: "bg-orange-500/20 border border-orange-500/30",
    yellow: "bg-yellow-500/20 border border-yellow-500/30",
    blue: "bg-blue-500/20 border border-blue-500/30",
    emerald: "bg-green-500/20 border border-green-500/30",
    indigo: "bg-indigo-500/20 border border-indigo-500/30",
    red: "bg-red-500/20 border border-red-500/30",
    gray: "bg-slate-900/50 border border-slate-800",
  };

  const iconColor = color ? colorMap[color] : "text-slate-400";
  const activeBg = color
    ? bgColorMap[color]
    : "bg-slate-900/50 border border-slate-800";

  return (
    <button
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all ${
        active
          ? `${activeBg} text-white`
          : `text-slate-400 hover:text-white hover:${iconColor} hover:bg-slate-900/50`
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${active ? iconColor : ""}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count && (
        <span
          className={`rounded px-2 py-0.5 text-xs ${active ? "bg-slate-900/50" : "bg-slate-900/50"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function EmailItem({
  sender,
  subject,
  time,
  count,
  badges,
  active,
  logo,
  avatarColor,
}: {
  sender: string;
  subject: string;
  time: string;
  count?: string;
  badges?: Array<{ icon: LucideIcon; color: string; bg: string }>;
  active?: boolean;
  logo?: string;
  avatarColor?: string;
}) {
  return (
    <div
      className={`mb-2 flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
        active
          ? "border border-orange-500/30 bg-orange-500/10 shadow-lg shadow-orange-500/10"
          : "border border-slate-800 bg-slate-900/50 hover:bg-slate-800"
      }`}
    >
      {logo ? (
        <div
          className={`h-8 w-8 bg-gradient-to-br ${avatarColor} flex flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-lg`}
        >
          {logo}
        </div>
      ) : (
        <div
          className={`h-8 w-8 bg-gradient-to-br ${avatarColor} flex flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg`}
        >
          {sender[0]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white">
            {sender}
          </span>
          {count && (
            <span className="flex-shrink-0 rounded border border-slate-800 bg-slate-900/50 px-1.5 py-0.5 text-xs text-slate-400">
              {count}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-xs text-slate-400">
            {time}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex-1 truncate text-xs text-slate-400">
            {subject}
          </span>
          {badges && badges.length > 0 && (
            <div className="flex flex-shrink-0 gap-1">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  className={`p-1 ${badge.bg} rounded border border-white/10`}
                >
                  <badge.icon className={`h-3 w-3 ${badge.color}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
