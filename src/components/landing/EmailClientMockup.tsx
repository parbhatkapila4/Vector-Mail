"use client";

import { motion } from "framer-motion";
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
  Sparkles,
  ChevronDown,
  Zap,
  User,
  Clock,
} from "lucide-react";

export function EmailClientMockup() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 via-purple-950/20 to-black shadow-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-purple-500/20 bg-black/40 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 text-sm font-bold text-white shadow-lg shadow-purple-500/50">
            V
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
            W
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-emerald-400 transition-colors hover:from-emerald-500/30 hover:to-blue-500/30">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-4 max-w-md flex-1">
          <div className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search emails..."
              className="flex-1 bg-transparent text-sm text-white outline-none"
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400 transition-colors hover:from-orange-500/30 hover:to-red-500/30">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-black bg-red-500" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 transition-colors hover:from-blue-500/30 hover:to-purple-500/30">
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="h-8 w-8 rounded-full border-2 border-purple-500/50 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400" />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-500/30 bg-gradient-to-br from-gray-500/20 to-gray-700/20 text-gray-400 transition-colors hover:from-gray-500/30 hover:to-gray-700/30">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Left Sidebar */}
        <div className="flex w-56 flex-col border-r border-purple-500/20 bg-black/20">
          <div className="p-4">
            {/* Account */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 font-bold text-white shadow-lg shadow-purple-500/50">
                V
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">
                  VectorMail
                </div>
                <div className="truncate text-xs text-purple-300">
                  work@vectormail.ai
                </div>
              </div>
            </div>

            {/* New Email Button */}
            <button className="mb-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/50 transition-colors hover:from-purple-700 hover:via-purple-500 hover:to-amber-500">
              <Mail className="h-4 w-4" />
              <span>New email</span>
            </button>

            {/* Navigation */}
            <div className="space-y-1">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
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
              <NavItem icon={Clock} label="Drafts" count="13" color="blue" />
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

          {/* Bottom Nav */}
          <div className="mt-auto space-y-1 border-t border-purple-500/20 p-4">
            <NavItem icon={Settings} label="Settings" color="gray" />
            <NavItem icon={HelpCircle} label="Support" color="blue" />
          </div>
        </div>

        {/* Middle: Email List */}
        <div className="flex w-80 flex-col border-r border-purple-500/20 bg-black/10">
          {/* Header */}
          <div className="border-b border-purple-500/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                Inbox
              </h2>
              <button className="text-sm font-medium text-purple-400 transition-colors hover:text-purple-300">
                ✓ Select
              </button>
            </div>

            {/* Search */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-purple-500/20 bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent text-sm text-white outline-none"
                readOnly
              />
              <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                ⌘K
              </span>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-purple-500/40 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20">
                <Zap className="h-4 w-4 text-yellow-400" />
                Primary
              </button>
              <button className="rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 to-orange-500/10 p-2 transition-colors hover:from-red-500/20 hover:to-orange-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </button>
              <button className="rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 transition-colors hover:from-blue-500/20 hover:to-purple-500/20">
                <User className="h-4 w-4 text-blue-400" />
              </button>
              <button className="rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-2 transition-colors hover:from-emerald-500/20 hover:to-green-500/20">
                <Bell className="h-4 w-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {/* Pinned Section */}
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  Pinned
                </span>
                <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
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

            {/* Primary Section */}
            <div className="px-4 pb-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Primary
                </span>
                <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
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

        {/* Right: Email Content */}
        <div className="flex flex-1 flex-col bg-gradient-to-br from-black/50 via-purple-950/5 to-black/50">
          {/* Email Header */}
          <div className="border-b border-purple-500/20 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-white">
                  Re: VectorMail v2.0 roadmap
                  <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-sm text-purple-300">
                    6
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="h-4 w-4" />
                  <span>March 25 - March 29</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 px-3 py-2 text-sm text-white transition-colors hover:from-purple-600/30 hover:via-purple-400/30 hover:to-amber-400/30">
                  <Reply className="h-4 w-4" />
                  Reply all
                </button>
                <button className="rounded-lg border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-2 text-yellow-400 transition-colors hover:from-yellow-500/20 hover:to-orange-500/20 hover:text-yellow-300">
                  <Star className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-red-500/30 bg-gradient-to-br from-red-500/10 to-rose-500/10 p-2 text-red-400 transition-colors hover:from-red-500/20 hover:to-rose-500/20 hover:text-red-300">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Participants */}
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
                  <span className="text-sm text-gray-300">{person.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 via-purple-400/10 to-amber-400/10 p-4 shadow-lg shadow-purple-500/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">
                    AI Summary
                  </span>
                  <span className="rounded-full border border-purple-500/50 bg-purple-500/30 px-2 py-0.5 text-xs text-purple-300">
                    New
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                VectorMail v2.0 product roadmap discussion. Team reviewed
                AI-powered features, semantic search improvements, and inbox
                management tools. Positive feedback on the new dashboard design
                and keyboard shortcuts implementation.
              </p>
            </motion.div>

            {/* Attachments */}
            <div className="rounded-xl border border-blue-500/20 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">
                    Attachments
                  </span>
                  <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                    4
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-blue-400" />
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
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10"
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
                      <div className="text-xs text-gray-400">{file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Thread */}
            <div className="space-y-4">
              {/* David's Message */}
              <div className="rounded-xl border border-purple-500/20 bg-white/5 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 font-bold text-white shadow-lg shadow-purple-500/50">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        David Chen
                      </span>
                      <span className="text-xs text-gray-400">
                        March 25, 10:15 AM
                      </span>
                    </div>
                    <div className="mb-3 text-xs text-purple-300">
                      To: Emma, Mike
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Hey team! Just pushed the latest VectorMail dashboard
                      updates. The new semantic search is lightning fast and the
                      AI summaries are incredibly accurate. Ready for your
                      review - let me know what you think!
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 px-3 py-1.5 text-xs text-white transition-colors hover:from-purple-600/30 hover:via-purple-400/30 hover:to-amber-400/30">
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:from-blue-500/30 hover:to-cyan-500/30">
                    <Forward className="h-3 w-3" />
                    Forward
                  </button>
                </div>
              </div>

              {/* Emma's Message */}
              <div className="rounded-xl border border-emerald-500/20 bg-white/5 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500 font-bold text-white shadow-lg shadow-emerald-500/50">
                    E
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        Emma Rodriguez
                      </span>
                      <span className="text-xs text-gray-400">
                        March 25, 2:30 PM
                      </span>
                    </div>
                    <div className="mb-3 text-xs text-purple-300">
                      To: David
                    </div>
                    <p className="text-sm leading-relaxed text-gray-300">
                      Tested the new features thoroughly and I'm impressed! The
                      keyboard shortcuts are incredibly intuitive and the
                      AI-powered responses save so much time. This is exactly
                      what power users need. Ready to ship! 🚀
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:from-emerald-500/30 hover:to-green-500/30">
                    <Reply className="h-3 w-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-3 py-1.5 text-xs text-white transition-colors hover:from-blue-500/30 hover:to-cyan-500/30">
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
  icon: any;
  label: string;
  count?: string;
  active?: boolean;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    purple: "text-purple-400",
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    red: "text-red-400",
    gray: "text-gray-400",
  };

  const bgColorMap: Record<string, string> = {
    purple:
      "bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30",
    yellow:
      "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30",
    blue: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30",
    emerald:
      "bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30",
    indigo:
      "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30",
    red: "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30",
    gray: "bg-white/5 border border-white/10",
  };

  const iconColor = color ? colorMap[color] : "text-gray-400";
  const activeBg = color
    ? bgColorMap[color]
    : "bg-white/10 border border-white/20";

  return (
    <button
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all ${
        active
          ? `${activeBg} text-white`
          : `text-gray-400 hover:text-white hover:${iconColor} hover:bg-white/5`
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${active ? iconColor : ""}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count && (
        <span
          className={`rounded px-2 py-0.5 text-xs ${active ? "bg-white/20" : "bg-white/10"}`}
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
  badges?: Array<{ icon: any; color: string; bg: string }>;
  active?: boolean;
  logo?: string;
  avatarColor?: string;
}) {
  return (
    <div
      className={`mb-2 flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all ${
        active
          ? "border border-purple-500/30 bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 shadow-lg shadow-purple-500/10"
          : "border border-white/10 bg-white/5 hover:bg-white/10"
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
            <span className="flex-shrink-0 rounded border border-purple-500/30 bg-purple-500/20 px-1.5 py-0.5 text-xs text-purple-300">
              {count}
            </span>
          )}
          <span className="ml-auto flex-shrink-0 text-xs text-gray-400">
            {time}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex-1 truncate text-xs text-gray-400">
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
