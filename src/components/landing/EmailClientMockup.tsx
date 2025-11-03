"use client";

import { motion } from "framer-motion";
import { 
  Mail, Search, Bell, HelpCircle, Settings, Plus, 
  Star, Send, Archive, AlertTriangle, Trash, 
  MoreHorizontal, Reply, Forward, Paperclip, Sparkles,
  ChevronDown, Zap, User, Clock
} from "lucide-react";

export function EmailClientMockup() {
  return (
    <div className="relative bg-gradient-to-br from-zinc-900 via-purple-950/20 to-black rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/50">
            V
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <button className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 hover:from-emerald-500/30 hover:to-blue-500/30 rounded-lg flex items-center justify-center text-emerald-400 transition-colors border border-emerald-500/30">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-purple-500/20">
            <Search className="w-4 h-4 text-purple-400" />
            <input
              type="text"
              placeholder="Search emails..."
              className="bg-transparent text-white text-sm flex-1 outline-none"
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-lg flex items-center justify-center text-orange-400 transition-colors border border-orange-500/30">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black" />
          </button>
          <button className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg flex items-center justify-center text-blue-400 transition-colors border border-blue-500/30">
            <HelpCircle className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-full border-2 border-purple-500/50" />
          <button className="w-8 h-8 bg-gradient-to-br from-gray-500/20 to-gray-700/20 hover:from-gray-500/30 hover:to-gray-700/30 rounded-lg flex items-center justify-center text-gray-400 transition-colors border border-gray-500/30">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex h-[600px]">
        {/* Left Sidebar */}
        <div className="w-56 border-r border-purple-500/20 bg-black/20 flex flex-col">
          <div className="p-4">
            {/* Account */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                V
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">VectorMail</div>
                <div className="text-purple-300 text-xs truncate">work@vectormail.ai</div>
              </div>
            </div>

            {/* New Email Button */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 via-purple-400 to-amber-400 hover:from-purple-700 hover:via-purple-500 hover:to-amber-500 text-white rounded-lg font-semibold transition-colors mb-8 shadow-lg shadow-purple-500/50">
              <Mail className="w-4 h-4" />
              <span>New email</span>
            </button>

            {/* Navigation */}
            <div className="space-y-1">
              <div className="text-xs text-purple-300 uppercase tracking-wider mb-3 px-2 font-semibold">Core</div>
              <NavItem icon={Mail} label="Inbox" count="281" active color="purple" />
              <NavItem icon={Star} label="Favorites" color="yellow" />
              <NavItem icon={Clock} label="Drafts" count="13" color="blue" />
              <NavItem icon={Send} label="Sent" color="emerald" />
              <NavItem icon={Archive} label="Archive" color="indigo" />
              <NavItem icon={AlertTriangle} label="Spam" count="24" color="red" />
              <NavItem icon={Trash} label="Bin" color="gray" />
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="mt-auto p-4 border-t border-purple-500/20 space-y-1">
            <NavItem icon={Settings} label="Settings" color="gray" />
            <NavItem icon={HelpCircle} label="Support" color="blue" />
          </div>
        </div>

        {/* Middle: Email List */}
        <div className="w-80 border-r border-purple-500/20 bg-black/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                Inbox
              </h2>
              <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium">
                ✓ Select
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 mb-4 border border-purple-500/20">
              <Search className="w-4 h-4 text-purple-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-white text-sm flex-1 outline-none"
                readOnly
              />
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">⌘K</span>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/40 text-white rounded-lg text-sm font-semibold shadow-lg shadow-purple-500/20">
                <Zap className="w-4 h-4 text-yellow-400" />
                Primary
              </button>
              <button className="p-2 bg-gradient-to-br from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 rounded-lg transition-colors border border-red-500/30">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </button>
              <button className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 rounded-lg transition-colors border border-blue-500/30">
                <User className="w-4 h-4 text-blue-400" />
              </button>
              <button className="p-2 bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 rounded-lg transition-colors border border-emerald-500/30">
                <Bell className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {/* Pinned Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-purple-300 font-semibold flex items-center gap-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  Pinned
                </span>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">3</span>
              </div>
              
              <EmailItem
                sender="VectorMail Team"
                subject="New AI features launched"
                time="Mar 29"
                count="9"
                avatarColor="from-purple-600 via-purple-400 to-amber-400"
                badges={[
                  { icon: User, color: "text-blue-400", bg: "bg-blue-500/20" },
                  { icon: Bell, color: "text-emerald-400", bg: "bg-emerald-500/20" }
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
                  { icon: User, color: "text-purple-400", bg: "bg-purple-500/20" },
                  { icon: User, color: "text-amber-400", bg: "bg-amber-500/20" },
                  { icon: Bell, color: "text-yellow-400", bg: "bg-yellow-500/20" }
                ]}
              />
              <EmailItem
                sender="Security Alerts"
                subject="Weekly security digest"
                time="Mar 28"
                count="8"
                avatarColor="from-orange-500 to-red-500"
                badges={[
                  { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
                  { icon: User, color: "text-blue-400", bg: "bg-blue-500/20" }
                ]}
              />
            </div>

            {/* Primary Section */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-purple-300 font-semibold flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Primary
                </span>
                <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">278</span>
              </div>
              
              <EmailItem
                sender="Finance Team"
                subject="Monthly expense report ready"
                time="Mar 29"
                avatarColor="from-violet-500 to-purple-600"
                badges={[
                  { icon: AlertTriangle, color: "text-emerald-400", bg: "bg-emerald-500/20" },
                  { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/20" }
                ]}
                logo="F"
              />
              <EmailItem
                sender="Marketing"
                subject="Q1 campaign performance update"
                time="Mar 29"
                avatarColor="from-red-600 to-rose-700"
                badges={[
                  { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/20" }
                ]}
                logo="M"
              />
            </div>
          </div>
        </div>

        {/* Right: Email Content */}
        <div className="flex-1 bg-gradient-to-br from-black/50 via-purple-950/5 to-black/50 flex flex-col">
          {/* Email Header */}
          <div className="p-6 border-b border-purple-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white text-xl font-semibold mb-2 flex items-center gap-2">
                  Re: VectorMail v2.0 roadmap
                  <span className="text-sm text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">6</span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-purple-300">
                  <Clock className="w-4 h-4" />
                  <span>March 25 - March 29</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 hover:from-purple-600/30 hover:via-purple-400/30 hover:to-amber-400/30 rounded-lg text-white text-sm transition-colors border border-purple-500/30">
                  <Reply className="w-4 h-4" />
                  Reply all
                </button>
                <button className="p-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 rounded-lg text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-500/30">
                  <Star className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors border border-white/10">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gradient-to-br from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors border border-red-500/30">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Participants */}
            <div className="flex items-center gap-3">
              {[
                { name: 'David', color: 'from-purple-600 via-purple-400 to-amber-400' },
                { name: 'Emma', color: 'from-blue-500 to-cyan-500' },
                { name: 'Mike', color: 'from-emerald-500 to-green-500' }
              ].map((person, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${person.color} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                    {person.name[0]}
                  </div>
                  <span className="text-gray-300 text-sm">{person.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-600/10 via-purple-400/10 to-amber-400/10 rounded-xl p-4 border border-purple-500/30 shadow-lg shadow-purple-500/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-semibold text-sm">AI Summary</span>
                  <span className="px-2 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full border border-purple-500/50">New</span>
                </div>
                <ChevronDown className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                VectorMail v2.0 product roadmap discussion. Team reviewed AI-powered features, semantic search improvements, and inbox management tools. Positive feedback on the new dashboard design and keyboard shortcuts implementation.
              </p>
            </motion.div>

            {/* Attachments */}
            <div className="bg-white/5 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-semibold text-sm">Attachments</span>
                  <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">4</span>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'dashboard-mockup.fig', size: '21 MB', color: 'from-purple-600 via-purple-400 to-amber-400' },
                  { name: 'product-roadmap.docx', size: '3.7 MB', color: 'from-blue-500 to-indigo-500' },
                  { name: 'ui-screenshot.png', size: '2.3 MB', color: 'from-emerald-500 to-green-500' },
                  { name: 'tech-specs.pdf', size: '1.5 MB', color: 'from-orange-500 to-red-500' },
                ].map((file, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer border border-white/10">
                    <div className={`w-8 h-8 bg-gradient-to-br ${file.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <Paperclip className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-medium truncate">{file.name}</div>
                      <div className="text-gray-400 text-xs">{file.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Thread */}
            <div className="space-y-4">
              {/* David's Message */}
              <div className="bg-white/5 rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                    D
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">David Chen</span>
                      <span className="text-xs text-gray-400">March 25, 10:15 AM</span>
                    </div>
                    <div className="text-purple-300 text-xs mb-3">To: Emma, Mike</div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Hey team! Just pushed the latest VectorMail dashboard updates. The new semantic search is lightning fast and the AI summaries are incredibly accurate. Ready for your review - let me know what you think!
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 hover:from-purple-600/30 hover:via-purple-400/30 hover:to-amber-400/30 rounded-lg text-white text-xs transition-colors border border-purple-500/30">
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-white text-xs transition-colors border border-blue-500/30">
                    <Forward className="w-3 h-3" />
                    Forward
                  </button>
                </div>
              </div>

              {/* Emma's Message */}
              <div className="bg-white/5 rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/50">
                    E
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">Emma Rodriguez</span>
                      <span className="text-xs text-gray-400">March 25, 2:30 PM</span>
                    </div>
                    <div className="text-purple-300 text-xs mb-3">To: David</div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Tested the new features thoroughly and I'm impressed! The keyboard shortcuts are incredibly intuitive and the AI-powered responses save so much time. This is exactly what power users need. Ready to ship! 🚀
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 hover:from-emerald-500/30 hover:to-green-500/30 rounded-lg text-white text-xs transition-colors border border-emerald-500/30">
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 rounded-lg text-white text-xs transition-colors border border-blue-500/30">
                    <Forward className="w-3 h-3" />
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

function NavItem({ icon: Icon, label, count, active, color }: { 
  icon: any, 
  label: string, 
  count?: string, 
  active?: boolean,
  color?: string 
}) {
  const colorMap: Record<string, string> = {
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    indigo: 'text-indigo-400',
    red: 'text-red-400',
    gray: 'text-gray-400',
  };

  const bgColorMap: Record<string, string> = {
    purple: 'bg-gradient-to-r from-purple-600/20 via-purple-400/20 to-amber-400/20 border border-purple-500/30',
    yellow: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30',
    blue: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30',
    emerald: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30',
    indigo: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30',
    red: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30',
    gray: 'bg-white/5 border border-white/10',
  };

  const iconColor = color ? colorMap[color] : 'text-gray-400';
  const activeBg = color ? bgColorMap[color] : 'bg-white/10 border border-white/20';

  return (
    <button className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
      active ? `${activeBg} text-white` : `text-gray-400 hover:text-white hover:${iconColor} hover:bg-white/5`
    }`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${active ? iconColor : ''}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count && (
        <span className={`text-xs px-2 py-0.5 rounded ${active ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>
      )}
    </button>
  );
}

function EmailItem({ sender, subject, time, count, badges, active, logo, avatarColor }: {
  sender: string;
  subject: string;
  time: string;
  count?: string;
  badges?: Array<{ icon: any, color: string, bg: string }>;
  active?: boolean;
  logo?: string;
  avatarColor?: string;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all mb-2 ${
      active 
        ? 'bg-gradient-to-r from-purple-600/10 via-purple-400/10 to-amber-400/10 border border-purple-500/30 shadow-lg shadow-purple-500/10' 
        : 'bg-white/5 hover:bg-white/10 border border-white/10'
    }`}>
      {logo ? (
        <div className={`w-8 h-8 bg-gradient-to-br ${avatarColor} rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg`}>
          {logo}
        </div>
      ) : (
        <div className={`w-8 h-8 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
          {sender[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-white text-sm font-medium truncate">{sender}</span>
          {count && (
            <span className="text-xs text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded flex-shrink-0 border border-purple-500/30">{count}</span>
          )}
          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{time}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-xs truncate flex-1">{subject}</span>
          {badges && badges.length > 0 && (
            <div className="flex gap-1 flex-shrink-0">
              {badges.map((badge, i) => (
                <div key={i} className={`p-1 ${badge.bg} rounded border border-white/10`}>
                  <badge.icon className={`w-3 h-3 ${badge.color}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
