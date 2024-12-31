import { Video } from "../types/electron";
import { motion, AnimatePresence } from "framer-motion";

interface FullScreenPlayerProps {
  currentVideo: Video | null;
  thumbnailUrl: string | null;
  isVisible: boolean;
  onClose: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentVideo,
  thumbnailUrl,
  isVisible,
  onClose,
}) => {
  if (!currentVideo) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bottom-20 bg-black/90 backdrop-blur-xl z-40 flex items-center justify-center"
          onClick={onClose}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div 
            className="w-full max-w-4xl p-8 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative group w-[512px] h-[512px] mb-8">
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
            </div>
            <div className="text-3xl font-bold text-white mb-2 text-center">
              {currentVideo.title}
            </div>
            <div className="text-lg text-gray-400">Music Player</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
