import { Video } from "../types/electron";
import { motion, AnimatePresence } from "framer-motion";
import AudioSpectrum from "react-audio-spectrum";
import { useRef } from "react";

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
  const audioElementId = audioRef?.current?.id;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed h-screen inset-0 bottom-20 z-40 flex items-center justify-center app-drag-region"
          // onClick={onClose}
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
          {/* <div className=" group w-14 h-14 absolute top-[-13px] left-14">
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors duration-150 rounded-lg w-full h-full flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                />
              </svg>
            </button>
          </div> */}
          <motion.div
            className="w-full max-w-4xl p-8 flex flex-col items-center"
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
                  audioId={audioElementId}
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
