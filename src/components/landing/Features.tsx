"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";

export function Features() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = clickX / width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <section className="relative py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5">
            <Play className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm text-zinc-400">See it in action</span>
          </div>

          <h2 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Watch how it works
          </h2>

          <p className="mx-auto max-w-xl text-lg text-zinc-400">
            2 minutes to understand why VectorMail is different. See AI-powered
            search, smart summaries, and instant replies.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/20 opacity-50 blur-xl" />

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/Vector-Mail-Demo.mp4"
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                playsInline
              />

              {!isPlaying && (
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40"
                  onClick={togglePlay}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20">
                    <Play className="ml-1 h-8 w-8 fill-white text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="relative border-t border-zinc-800 bg-zinc-900/95 px-4 py-3">
              <div
                className="absolute left-0 right-0 top-0 h-1 -translate-y-full cursor-pointer bg-zinc-800"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 transition-colors hover:bg-zinc-700"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>

                  <span className="font-mono text-xs text-zinc-500">
                    {videoRef.current
                      ? formatTime(videoRef.current.currentTime)
                      : "0:00"}{" "}
                    /{" "}
                    {videoRef.current
                      ? formatTime(videoRef.current.duration || 0)
                      : "0:00"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">VectorMail Demo</span>
                  <button
                    onClick={handleFullscreen}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800"
                  >
                    <Maximize2 className="h-4 w-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { time: "0:30", label: "How Emails Are Fetched" },
            { time: "1:00", label: "AI Compose, Reply & Search" },
            { time: "3:20", label: "AI Buddy" },
            { time: "4:00", label: "How AI Assistant Works" },
          ].map((chapter, i) => (
            <button
              key={i}
              onClick={() => {
                if (videoRef.current) {
                  const [mins, secs] = chapter.time.split(":").map(Number);
                  videoRef.current.currentTime = (mins ?? 0) * 60 + (secs ?? 0);
                  if (!isPlaying) {
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-800/50"
            >
              <div className="mb-1 font-mono text-sm text-amber-400">
                {chapter.time}
              </div>
              <div className="text-sm text-zinc-400 transition-colors group-hover:text-zinc-300">
                {chapter.label}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-zinc-500">Ready to try it yourself?</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
