import { Video } from "../types/electron";
import { motion, AnimatePresence } from "framer-motion";
import AudioSpectrum from "react-audio-spectrum";
import { useRef, useEffect, useState } from "react";

interface FullScreenPlayerProps {
  currentVideo: Video | null;
  isVisible: boolean;
  onClose: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentVideo,
  isVisible,
  onClose,
  audioRef,
}) => {
  if (!currentVideo) return null;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentVideo?.thumbnail) {
      window.electronAPI.fetchImage(currentVideo.thumbnail).then(setThumbnailUrl);
    }
  }, [currentVideo?.thumbnail]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed h-screen inset-0 bottom-20 z-40 flex items-center justify-center overflow-hidden"
          initial={{
            y: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(16px)",
          }}
          animate={{
            y: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(16px)",
          }}
          exit={{
            y: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(16px)",
          }}
          transition={{
            type: "spring",
            damping: 27,
            stiffness: 200,
            backgroundColor: { duration: 0 },
            backdropFilter: { duration: 0 },
          }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Background Image */}
          {thumbnailUrl && (
            <div
              // className="absolute inset-0 z-0 app-drag-region"
              style={{
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(32px) brightness(0.3)',
                transform: 'scale(1.1)',
              }}
            />
          )}

          <motion.div
            className="w-full max-w-4xl p-8 flex flex-col items-center relative z-10"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 300,
              opacity: { duration: 0.2 },
            }}
          >
            <div className="relative group">
              <div
                className="w-[518px] h-[518px] mb-4 relative flex items-center justify-center"
                ref={containerRef}
              >
                <AudioSpectrum
                  id="audio-canvas"
                  height={518}
                  width={518}
                  audioId="audio-element"
                  capColor={"#FDF2F8"}
                  capHeight={2}
                  meterWidth={4}
                  meterCount={512}
                  meterColor={[
                    { stop: 0, color: "#FDF2F8" },
                    { stop: 0.5, color: "#FCE7F3" },
                    { stop: 1, color: "#FBCFE8" },
                  ]}
                  gap={2}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
