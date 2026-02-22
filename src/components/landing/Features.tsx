"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Mail,
  Search,
  Bot,
  MessageCircle,
} from "lucide-react";

const CHAPTERS = [
  { time: "0:30", label: "How Emails Are Fetched", icon: Mail },
  { time: "1:00", label: "AI Compose, Reply & Search", icon: Search },
  { time: "3:20", label: "AI Buddy", icon: Bot },
  { time: "4:00", label: "How AI Assistant Works", icon: MessageCircle },
] as const;

function timeToSeconds(time: string): number {
  const [mins, secs] = time.split(":").map(Number);
  return (mins ?? 0) * 60 + (secs ?? 0);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function Features() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const ct = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(ct);
      setDuration(dur);
      setProgress(dur > 0 ? (ct / dur) * 100 : 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && videoRef.current.duration && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setHoverProgress(percentage);
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const seekToChapter = (time: string) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeToSeconds(time);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const currentChapterIndex = CHAPTERS.findIndex(
    (c) => timeToSeconds(c.time) <= currentTime
  );
  const activeIndex = currentChapterIndex >= 0 ? currentChapterIndex : 0;

  return (
    <section className="relative overflow-hidden py-32">

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">

        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mb-6 inline-block rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-1.5 text-sm font-medium tracking-wide text-violet-300">
            Product demo
          </span>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Watch how it works
          </h2>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-400">
            Two minutes to see why VectorMail is different — AI search, smart
            summaries, and instant replies.
          </p>
        </motion.div>


        <motion.div
          className="relative mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >

          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-violet-500/40 via-fuchsia-500/30 to-violet-500/40 opacity-70 blur-xl" />
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-violet-500/20 via-transparent to-violet-500/20" />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-sm">

            <div
              className="relative aspect-video bg-black"
              onClick={!isPlaying ? togglePlay : undefined}
            >
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/Vector-Mail-Demo.mp4"
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                playsInline
              />

              <AnimatePresence mode="wait">
                {!isPlaying ? (
                  <motion.div
                    key="overlay"
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="flex h-28 w-28 items-center justify-center rounded-full border border-white/20 bg-white/5 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/15 hover:border-white/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-white/10 opacity-0 [animation-duration:2s] hover:opacity-100" />
                      <Play className="ml-2 h-12 w-12 fill-white text-white drop-shadow-lg" />
                    </motion.button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              ref={progressRef}
              className="group relative h-2 cursor-pointer bg-white/5 transition-colors hover:bg-white/10"
              onClick={handleProgressClick}
              onMouseMove={handleProgressHover}
              onMouseLeave={() => setHoverProgress(null)}
            >
              <div
                className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-lg shadow-violet-500/30 transition-opacity duration-150 group-hover:opacity-100"
                style={{
                  left: `calc(${progress}% - 10px)`,
                  opacity: hoverProgress !== null ? 1 : 0.8,
                }}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 bg-zinc-900/95 px-5 py-3.5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
                  whileTap={{ scale: 0.95 }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </motion.button>
                <span className="font-mono text-sm tabular-nums text-zinc-500">
                  {formatTime(currentTime)}
                  <span className="text-zinc-600"> / {formatTime(duration)}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400">
                  VectorMail Demo
                </span>
                <motion.button
                  type="button"
                  onClick={handleFullscreen}
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-200"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CHAPTERS.map((chapter, i) => {
              const Icon = chapter.icon;
              const isActive = activeIndex === i;
              return (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => seekToChapter(chapter.time)}
                  className={`group relative flex flex-col rounded-2xl p-5 text-left transition-all duration-300 ${isActive
                      ? "bg-gradient-to-b from-violet-500/20 to-violet-500/5 shadow-lg shadow-violet-500/10 ring-1 ring-violet-400/30"
                      : "bg-white/[0.02] ring-1 ring-white/5 hover:bg-white/[0.06] hover:ring-white/10"
                    }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-violet-500/5"
                      layoutId="chapter-active"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <div className="relative flex items-center gap-3">
                    <span
                      className={`font-mono text-sm font-bold tabular-nums ${isActive ? "text-violet-300" : "text-zinc-500"
                        }`}
                    >
                      {chapter.time}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <span
                    className={`relative mt-2 text-sm font-medium leading-snug ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                      }`}
                  >
                    {chapter.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
