import { Video } from "../types/electron";
import useAudioPlayer from "../hooks/useAudioPlayer";
import { formatTime } from "./utils";
import { useState, useRef } from "react";
import { FullScreenPlayer } from "./FullScreenPlayer";
import { BilibiliPlayer } from "./BilibiliPlayer";

interface ModernPlayerProps {
  currentVideo: Video | null;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const ModernPlayer: React.FC<ModernPlayerProps> = ({
  currentVideo,
  onPrevious,
  onNext,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBilibiliPlayer, setShowBilibiliPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    isPlaying,
    currentTime,
    thumbnailUrl,
    duration,
    volume,
    isMuted,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleTimeSeek,
    handlePrevious,
    handleNext,
  } = useAudioPlayer({ currentVideo, onPrevious, onNext });

  if (!currentVideo) {
    return (
      <div className="h-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">从列表中选择音乐开始播放</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <FullScreenPlayer
        currentVideo={currentVideo}
        thumbnailUrl={thumbnailUrl}
        isVisible={isExpanded}
        onClose={() => setIsExpanded(false)}
        audioRef={audioRef}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 shadow-2xl transition-all duration-300 h-24 border-t z-50 backdrop-blur-2xl ${
          isExpanded
            ? "bg-transparent border-white/10"
            : "bg-white/90 border-pink-100/50"
        }`}
      >
        <div className="flex items-center justify-between h-full px-6 max-w-[1920px] mx-auto">
          {/* Left Section: Cover and Title */}
          <div className="flex items-center space-x-3 w-1/4 min-w-[220px]">
            {isExpanded ? null : (
              <div
                className="relative group cursor-pointer transition-opacity duration-300 opacity-100"
                onClick={() => setIsExpanded(true)}
              >
                <div
                  className={`w-14 h-14 flex-shrink-0 rounded-xl shadow-lg overflow-hidden ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105`}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Cover"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-pink-300 dark:text-pink-500"
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
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium ${
                  isExpanded ? "text-white" : "text-gray-900 dark:text-white"
                } truncate group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors duration-150`}
              >
                {currentVideo?.title || "No track selected"}
              </div>
              <div
                className={`text-xs ${
                  isExpanded
                    ? "text-gray-300"
                    : "text-gray-500 dark:text-gray-400"
                } truncate mt-0.5 font-medium`}
              >
                Music Player
              </div>
            </div>
          </div>

          {/* Center Section: Main Controls */}
          <div className="flex flex-col items-center w-2/4 max-w-[500px] px-4">
            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-6 mb-2">
              <button
                className={`${
                  isExpanded
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20`}
                onClick={handlePrevious}
                disabled={!onPrevious}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M18 6l-8.5 6L18 18V6zM8 6v12H6V6h2z"
                  />
                </svg>
              </button>
              <button
                onClick={togglePlay}
                className={`${
                  isExpanded
                    ? "text-white hover:text-pink-400"
                    : "text-gray-800 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400"
                } transition-all duration-150 p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20 relative group`}
              >
                <div className="absolute inset-0 bg-pink-400/10 dark:bg-pink-400/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-150" />
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                  </svg>
                )}
              </button>
              <button
                className={`${
                  isExpanded
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20`}
                onClick={handleNext}
                disabled={!onNext}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                  />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center space-x-2 w-full">
              <span
                className={`text-[10px] font-medium ${
                  isExpanded
                    ? "text-gray-300"
                    : "text-gray-500 dark:text-gray-400"
                } w-8 text-right select-none`}
              >
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 group relative h-1.5">
                <div className="absolute inset-y-0 w-full flex items-center">
                  <div
                    className={`h-[3px] w-full ${
                      isExpanded
                        ? "bg-gray-700"
                        : "bg-gray-200 dark:bg-gray-700"
                    } rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-150"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleTimeSeek(e.target.valueAsNumber)}
                  className="absolute inset-y-0 w-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute h-2 w-2 bg-pink-500 dark:bg-pink-400 rounded-full shadow-sm top-1/2 -mt-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isExpanded
                    ? "text-gray-300"
                    : "text-gray-500 dark:text-gray-400"
                } w-8 select-none`}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Section: Volume Control */}
          <div className="flex items-center justify-end space-x-3 w-1/4 min-w-[180px]">
            <button
              onClick={toggleMute}
              className={`${
                isExpanded
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20`}
            >
              {isMuted || volume === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  />
                </svg>
              )}
            </button>
            <div className="w-24 group relative h-1.5">
              <div className="absolute inset-y-0 w-full flex items-center">
                <div
                  className={`h-[3px] w-full ${
                    isExpanded ? "bg-gray-700" : "bg-gray-200 dark:bg-gray-700"
                  } rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-150"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => handleVolumeChange(e.target.valueAsNumber)}
                className="absolute inset-y-0 w-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute h-2 w-2 bg-pink-500 dark:bg-pink-400 rounded-full shadow-sm top-1/2 -mt-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ left: `${volume * 100}%` }}
              />
            </div>
            {/* Bilibili Icon */}
            <button
              onClick={() => setShowBilibiliPlayer(true)}
              className={`ml-2 text-[#00a1d6] hover:text-[#00b5e5] transition-colors duration-150 p-1.5 rounded-full hover:bg-[#00a1d6]/5`}
              title="在 B 站观看"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M306.005333 117.632L444.330667 256h135.296l138.368-138.325333a42.666667 42.666667 0 0 1 60.373333 60.373333L700.330667 256H789.333333A149.333333 149.333333 0 0 1 938.666667 405.333333v341.333334a149.333333 149.333333 0 0 1-149.333334 149.333333h-554.666666A149.333333 149.333333 0 0 1 85.333333 746.666667v-341.333334A149.333333 149.333333 0 0 1 234.666667 256h88.96L245.632 177.962667a42.666667 42.666667 0 0 1 60.373333-60.373334zM789.333333 341.333333h-554.666666a64 64 0 0 0-63.701334 57.856L170.666667 405.333333v341.333334a64 64 0 0 0 57.856 63.701333L234.666667 810.666667h554.666666a64 64 0 0 0 63.701334-57.856L853.333333 746.666667v-341.333334A64 64 0 0 0 789.333333 341.333333zM341.333333 469.333333a42.666667 42.666667 0 0 1 42.666667 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666666-42.666667z m341.333334 0a42.666667 42.666667 0 0 1 42.666666 42.666667v85.333333a42.666667 42.666667 0 0 1-85.333333 0v-85.333333a42.666667 42.666667 0 0 1 42.666667-42.666667z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Bilibili Player */}
      {showBilibiliPlayer && (
        <BilibiliPlayer
          currentVideo={currentVideo}
          onClose={() => setShowBilibiliPlayer(false)}
        />
      )}
    </>
  );
};
