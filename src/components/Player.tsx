import { Video } from "../types/electron";
import useAudioPlayer from "../hooks/useAudioPlayer";

interface ModernPlayerProps {
  currentVideo: Video | null;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const ModernPlayer: React.FC<ModernPlayerProps> = ({ currentVideo }) => {
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
  } = useAudioPlayer(currentVideo);

  if (!currentVideo) {
    return (
      <div className="h-20 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 13.535V3.929L9.172 6.757L7.757 5.343L12 1.1l4.243 4.243l-1.415 1.414L12 3.929v9.606c1.196.276 2.087 1.335 2.087 2.616c0 1.474-1.194 2.667-2.667 2.667s-2.667-1.193-2.667-2.667c0-1.281.891-2.34 2.087-2.616Z"
            />
          </svg>
          <span className="text-sm font-medium">从列表中选择音乐开始播放</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 h-20`}
    >
      <div className="flex items-center h-full p-4 rounded-t-lg border-t-2 border-gray-300 dark:border-gray-600">
        {/* Cover Image */}
        <div
          className={`relative w-16 h-16 mr-4 rounded-lg shadow-lg overflow-hidden`}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 max-w-4xl">
          {/* Title */}
          <div className="text-lg font-semibold mb-2 dark:text-white truncate">
            {currentVideo?.title}
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleTimeSeek(e.target.valueAsNumber)}
                className="w-full h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                onClick={() => {
                  /* Previous track */
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
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
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8"
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
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                  >
                    <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                  </svg>
                )}
              </button>
              <button
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                onClick={() => {
                  /* Next track */
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"
                  />
                </svg>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                {isMuted || volume === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
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
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                    />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => handleVolumeChange(e.target.valueAsNumber)}
                className="w-20 h-1 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
