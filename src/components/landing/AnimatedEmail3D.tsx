"use client";

import { Mail } from "lucide-react";

export function AnimatedEmail3D() {
  return (
    <div className="pointer-events-none relative flex h-[500px] w-full items-center justify-center">
      <div className="relative h-[500px] w-[500px]">
        <div
          className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 100%)",
            willChange: "auto",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[250px] w-[250px] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0.4) 50%, transparent 100%)",
            willChange: "auto",
          }}
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute h-48 w-64 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-yellow-900/20 backdrop-blur-xl"
            style={{
              transform: "translateZ(-20px)",
              boxShadow:
                "0 0 80px rgba(168, 85, 247, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.2)",
              willChange: "auto",
            }}
          />

          <div
            className="relative h-48 w-64 overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-gray-900 via-purple-900/50 to-yellow-900/50 backdrop-blur-xl"
            style={{
              borderColor: "rgba(168, 85, 247, 0.5)",
              boxShadow:
                "0 0 100px rgba(168, 85, 247, 0.6), inset 0 0 80px rgba(168, 85, 247, 0.3)",
              willChange: "auto",
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-24 bg-gradient-to-br from-purple-600/40 via-purple-400/40 to-yellow-400/40 opacity-50"
              style={{
                clipPath: "polygon(0 0, 50% 60%, 100% 0)",
                borderBottom: "1px solid rgba(168, 85, 247, 0.5)",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <Mail className="h-16 w-16 text-purple-300" strokeWidth={1.5} />
            </div>

            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50"
                style={{ top: `${35 + i * 15}%` }}
              />
            ))}
          </div>

          <div
            className="absolute h-48 w-64 rounded-2xl border border-purple-400/20"
            style={{
              transform: "translateZ(20px)",
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)",
              willChange: "auto",
            }}
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-1/2 h-32 w-[400px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />
    </div>
  );
}
