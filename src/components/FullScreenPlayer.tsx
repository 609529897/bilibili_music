import { Video } from "../types/electron";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FullScreenPlayerProps {
  currentVideo: Video | null;
  isVisible: boolean;
  onClose: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentVideo,
  isVisible,
  audioRef,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentVideo?.thumbnail) {
      window.electronAPI
        .fetchImage(currentVideo.thumbnail)
        .then(setThumbnailUrl);
    }
  }, [currentVideo?.thumbnail]);

  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    // 初始化播放状态
    setIsPlaying(!audio.paused);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef]);

  if (!currentVideo) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed h-screen inset-0 bottom-20 z-40 flex items-center justify-center overflow-hidden app-drag-region bg-black"
          initial={{
            y: "100%",
            backgroundColor: "rgba(0, 0, 0, 1)",
            backdropFilter: "blur(16px)",
          }}
          animate={{
            y: 0,
            backgroundColor: "rgba(0, 0, 0, 1)",
            backdropFilter: "blur(16px)",
          }}
          exit={{
            y: "100%",
            backgroundColor: "rgba(0, 0, 0, 1)",
            backdropFilter: "blur(16px)",
          }}
          transition={{
            type: "spring",
            damping: 27,
            stiffness: 200,
          }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 1)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Background Image */}
          {thumbnailUrl && (
            <div
              className="absolute inset-0 z-0 app-drag-region"
              style={{
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(32px) brightness(0.3)",
                transform: "scale(1.1)",
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
              <div className="w-[518px] h-[518px] mb-4 relative flex items-center justify-center">
                {/* 封面图片 */}
                {thumbnailUrl && (
                  <div className={`music-ripple ${!isPlaying ? 'animation-paused' : ''}`}>
                    <motion.img
                      src={thumbnailUrl}
                      alt={currentVideo.title}
                      className="w-[320px] h-[320px] rounded-full object-cover rotate-animation"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 300,
                      }}
                      style={{
                        animationPlayState: isPlaying ? 'running' : 'paused'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
