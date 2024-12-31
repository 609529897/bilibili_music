import { Video } from "../types/electron";
import { motion, AnimatePresence } from "framer-motion";
import AudioSpectrum from 'react-audio-spectrum';

interface FullScreenPlayerProps {
  currentVideo: Video | null;
  thumbnailUrl: string | null;
  isVisible: boolean;
  onClose: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentVideo,
  thumbnailUrl,
  isVisible,
  onClose,
  audioRef,
}) => {
  if (!currentVideo) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed h-screen inset-0 bottom-20 z-40 flex items-center justify-center"
          onClick={onClose}
          initial={{ y: "100%", backgroundColor: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(16px)" }}
          animate={{ y: 0, backgroundColor: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(16px)" }}
          exit={{ y: "100%", backgroundColor: "rgba(0, 0, 0, 0.9)", backdropFilter: "blur(16px)" }}
          transition={{ 
            type: "spring", 
            damping: 26, 
            stiffness: 200,
            backgroundColor: { duration: 0 },
            backdropFilter: { duration: 0 }
          }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(16px)"
          }}
        >
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
              opacity: { duration: 0.2 }
            }}
          >
            <div className="relative group">
              <div className="w-[512px] h-[512px] mb-8 relative">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 flex items-center justify-center rounded-3xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-32 w-32 text-pink-300 dark:text-pink-500"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                      />
                    </svg>
                  </div>
                )}
                
                {/* Audio Spectrum Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-32 flex items-end justify-center overflow-hidden rounded-b-3xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {audioRef && audioRef.current && (
                    <AudioSpectrum
                      id="audio-canvas"
                      height={100}
                      width={512}
                      audioId={audioRef.current.id}
                      capColor={'#fff'}
                      capHeight={2}
                      meterWidth={2}
                      meterCount={512}
                      meterColor={[
                        {stop: 0, color: '#f472b6'},
                        {stop: 0.5, color: '#ec4899'},
                        {stop: 1, color: '#be185d'}
                      ]}
                      gap={1}
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
