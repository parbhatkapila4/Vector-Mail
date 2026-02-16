"use client";

import { motion } from "framer-motion";
import {
  Mail,
  Star,
  Archive,
  Trash2,
  Search,
  MoreHorizontal,
  Reply,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";

export function ProductShowcase() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            See it in action
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Experience the clean, intuitive interface that makes email
            management effortless
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="ml-4 flex-1 rounded bg-white px-3 py-1 text-sm text-gray-500">
                vectormail.dev
              </div>
            </div>

            <div className="flex h-[600px] bg-gray-900 text-white">
              <div className="w-80 border-r border-gray-700 bg-gray-800 p-4">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    V
                  </div>
                  <div>
                    <div className="text-sm font-medium">VectorMail</div>
                    <div className="text-xs text-gray-400">
                      user@vectormail.dev
                    </div>
                  </div>
                </div>

                <button className="mb-6 w-full rounded-lg bg-gray-700 px-4 py-3 text-left transition-colors hover:bg-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>New email</span>
                  </div>
                </button>

                <div className="space-y-1">
                  <div className="mb-3 text-xs uppercase tracking-wider text-gray-400">
                    Core
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between rounded-lg bg-blue-600 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">Inbox</span>
                      </div>
                      <span className="rounded-full bg-blue-500 px-2 py-1 text-xs">
                        281
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-700">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">Favorites</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-700">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">AI Buddy</span>
                      </div>
                      <span className="rounded-full bg-gray-600 px-2 py-1 text-xs">
                        13
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-700">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Sent</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 text-xs uppercase tracking-wider text-gray-400">
                      Management
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-700">
                        <Archive className="h-4 w-4" />
                        <span className="text-sm">Archive</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-4 w-4 items-center justify-center rounded bg-red-500">
                            <span className="text-xs text-white">!</span>
                          </div>
                          <span className="text-sm">Spam</span>
                        </div>
                        <span className="rounded-full bg-gray-600 px-2 py-1 text-xs">
                          24
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-700">
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Bin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 border-r border-gray-700">
                <div className="border-b border-gray-700 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Inbox</h3>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-gray-400 hover:text-white">
                        ✓ Select
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Q Search"
                      className="w-full rounded-lg bg-gray-700 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 transform text-xs text-gray-500">
                      ⌘K
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 p-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
                      ⚡ Primary
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
                      <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600">
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <div className="mb-2 text-xs uppercase tracking-wider text-gray-400">
                      Pinned [3]
                    </div>
                    <div className="space-y-2">
                      <div className="cursor-pointer rounded-lg p-3 hover:bg-gray-700">
                        <div className="mb-1 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Ali from Baked
                            </span>
                            <span className="text-xs text-gray-400">[9]</span>
                          </div>
                          <span className="text-xs text-gray-400">Mar 29</span>
                        </div>
                        <div className="mb-1 text-sm text-gray-300">
                          New design review
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-400"></div>
                        </div>
                      </div>
                      <div className="cursor-pointer rounded-lg p-3 hover:bg-gray-700">
                        <div className="mb-1 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Alex, Ali, Sarah
                            </span>
                            <span className="text-xs text-gray-400">[6]</span>
                          </div>
                          <span className="text-xs text-gray-400">Mar 28</span>
                        </div>
                        <div className="mb-1 text-sm text-gray-300">
                          Re: Design review feedback
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-400"></div>
                          <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs uppercase tracking-wider text-gray-400">
                      Primary [278]
                    </div>
                    <div className="space-y-2">
                      <div className="cursor-pointer rounded-lg p-3 hover:bg-gray-700">
                        <div className="mb-1 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-bold">
                              S
                            </div>
                            <span className="text-sm font-medium">Dodo Payments</span>
                          </div>
                          <span className="text-xs text-gray-400">Mar 29</span>
                        </div>
                        <div className="mb-1 text-sm text-gray-300">
                          Payment confirmation #1234
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                          <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                        </div>
                      </div>
                      <div className="cursor-pointer rounded-lg p-3 hover:bg-gray-700">
                        <div className="mb-1 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-red-600 text-xs font-bold">
                              N
                            </div>
                            <span className="text-sm font-medium">Netflix</span>
                          </div>
                          <span className="text-xs text-gray-400">Mar 29</span>
                        </div>
                        <div className="mb-1 text-sm text-gray-300">
                          New shows added this week
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-96 bg-gray-800">
                <div className="border-b border-gray-700 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 hover:bg-gray-700">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 hover:bg-gray-700">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded p-1 hover:bg-gray-700">
                        <Reply className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 hover:bg-gray-700">
                        <Star className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 hover:bg-gray-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="rounded p-1 hover:bg-gray-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-lg font-semibold">
                      Re: Design review feedback [6]
                    </h4>
                    <div className="mb-3 text-xs text-gray-400">
                      March 25 - March 29
                    </div>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs">
                          A
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs">
                          A
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs">
                          S
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 p-4">
                  <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-3">
                    <div className="mb-2 text-sm font-medium text-purple-300">
                      AI Summary
                    </div>
                    <div className="text-xs leading-relaxed text-purple-200">
                      Design review of new email client features. Team discussed
                      command center improvements and category system. General
                      positive feedback, with suggestions for quick actions
                      placement.
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-700 p-4">
                  <div className="mb-3 text-sm font-medium">
                    Attachments [4]
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-700">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <div className="flex-1">
                        <div className="text-sm">cmd.center.fig</div>
                        <div className="text-xs text-gray-400">21 MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-700">
                      <FileText className="h-4 w-4 text-green-400" />
                      <div className="flex-1">
                        <div className="text-sm">comments.docx</div>
                        <div className="text-xs text-gray-400">3.7 MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-700">
                      <ImageIcon className="h-4 w-4 text-purple-400" />
                      <div className="flex-1">
                        <div className="text-sm">img.png</div>
                        <div className="text-xs text-gray-400">2.3 MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-700">
                      <File className="h-4 w-4 text-red-400" />
                      <div className="flex-1">
                        <div className="text-sm">requirements.pdf</div>
                        <div className="text-xs text-gray-400">1.5 MB</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        Ali Mamedgasanov
                      </div>
                      <div className="text-xs text-gray-400">
                        To: Alex, Sarah
                      </div>
                    </div>
                    <div className="ml-auto text-xs text-gray-400">
                      March 25, 10:15 AM
                    </div>
                  </div>
                  <div className="text-sm leading-relaxed text-gray-300">
                    yo team, i've updated the email client design with some new
                    interactions. taking a different approach with the command
                    center - much cleaner now. check out the new flows and let
                    me know what you think!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
