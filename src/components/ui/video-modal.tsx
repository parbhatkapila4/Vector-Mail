"use client";
import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";

interface VideoModalProps {
  videoSrc: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function VideoModal({ videoSrc, isOpen, onClose, children }: VideoModalProps) {
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const closeVideoModal = () => {
    onClose();
    setIsVideoLoaded(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setIsVideoLoaded(false);
    }
  }, [isOpen]);

  if (children) {
    return (
      <>
        <div onClick={() => onClose()}>
          {children}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVideoModal}
            >
              <motion.div
                className="relative max-w-4xl w-full mx-4 bg-black/30 rounded-xl overflow-hidden border border-white/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <button
                    onClick={closeVideoModal}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  {!isVideoLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                      <button
                        onClick={handlePlayClick}
                        className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
                      >
                        <Play className="w-12 h-12 text-white" />
                      </button>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    src={videoSrc}
                    muted
                    controls
                    preload="metadata"
                    playsInline
                    webkit-playsinline="true"
                    className="w-full h-auto max-h-[80vh]"
                    onLoadedData={handleVideoLoad}
                    onCanPlay={() => setIsVideoLoaded(true)}
                    onEnded={closeVideoModal}
                    onError={(e) => {
                      console.error("Video error:", e);
                      setIsVideoLoaded(true);
                    }}
                    onLoadStart={() => console.log("Video loading started")}
                    onLoadedMetadata={() => console.log("Video metadata loaded")}
                  >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeVideoModal}
        >
          <motion.div
            className="relative max-w-4xl w-full mx-4 bg-black/30 rounded-xl overflow-hidden border border-white/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={closeVideoModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
              
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                  <button
                    onClick={handlePlayClick}
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-300"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                src={videoSrc}
                muted
                controls
                preload="metadata"
                playsInline
                webkit-playsinline="true"
                className="w-full h-auto max-h-[80vh]"
                onLoadedData={handleVideoLoad}
                onCanPlay={() => setIsVideoLoaded(true)}
                onEnded={closeVideoModal}
                onError={(e) => {
                  console.error("Video error:", e);
                  setIsVideoLoaded(true);
                }}
                onLoadStart={() => console.log("Video loading started")}
                onLoadedMetadata={() => console.log("Video metadata loaded")}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
