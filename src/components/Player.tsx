import { useEffect, useRef, useState } from "react";
import { Video } from "../types/electron";
import { fetchImage } from "../utils/imageProxy";

interface ModernPlayerProps {
  currentVideo: Video | null;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const ModernPlayer = ({ currentVideo }: ModernPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (currentVideo) {
      setIsLoadingImage(true);
      fetchImage(currentVideo.thumbnail)
        .then(setThumbnailUrl)
        .finally(() => setIsLoadingImage(false));
    }
  }, [currentVideo]);

  useEffect(() => {
    if (currentVideo && audioRef.current) {
      // 重置播放状态
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      // 设置新的音频源
      const handleAudio = async () => {
        try {
          const result = await window.electronAPI.getVideoAudioUrl(
            currentVideo.bvid
          );
          if (result.success && result.data.audioUrl) {
            audioRef.current!.src = result.data.audioUrl;
            audioRef.current!.load();
            // 自动播放
            await audioRef.current!.play();
            setIsPlaying(true);
          } else {
            console.error("Failed to get audio URL:", result.error);
            setIsPlaying(false);
          }
        } catch (error) {
          console.error("Failed to play audio:", error);
          setIsPlaying(false);
        }
      };

      handleAudio();
    }
  }, [currentVideo]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

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
      className={`${
        isFullscreen ? "absolute inset-0 z-50" : "h-20"
      } bg-white/95 backdrop-blur-md border-t border-gray-100`}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className={`${isFullscreen ? "h-full flex flex-col" : "h-full"}`}>
        {isFullscreen && (
          <div className="relative flex-1">
            {thumbnailUrl && (
              <div className="absolute inset-0">
                <img
                  src={thumbnailUrl}
                  alt={currentVideo.title}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}
          </div>
        )}

        <div
          className={`${
            isFullscreen
              ? "p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent"
              : "h-full px-8"
          }`}
        >
          <div className="h-full max-w-7xl mx-auto flex items-center gap-8">
            {/* 封面和信息 */}
            <div className="flex items-center gap-4 w-72">
              <div className="relative group">
                <div className="w-[3.25rem] h-[3.25rem] relative">
                  <img
                    src={
                      thumbnailUrl ||
                      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1ZTdlYiIgZD0iTTEyIDN2MTAuNTVjLS41OS0uMzQtMS4yNy0uNTUtMi0uNTVjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDRzNC0xLjc5IDQtNFY3aDRWM2gtNloiLz48L3N2Zz4="
                    }
                    alt={currentVideo.title}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                  {isLoadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 hover:bg-black/40 transition-all duration-200 group-hover:opacity-100 opacity-0"
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-white"
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
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                    >
                      <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`font-medium ${
                    isFullscreen ? "text-white" : "text-gray-900"
                  } truncate hover:text-pink-500 cursor-pointer transition-colors`}
                >
                  {currentVideo.title}
                </div>
                <div
                  className={`text-sm ${
                    isFullscreen ? "text-gray-200" : "text-gray-500"
                  } truncate hover:text-gray-300 cursor-pointer transition-colors`}
                >
                  {currentVideo.author}
                </div>
              </div>
            </div>

            {/* 播放控制 */}
            <div className="flex-1 flex flex-col gap-1.5 max-w-2xl">
              <div className="flex items-center justify-center gap-6">
                {/* 上一首 */}
                <button
                  className={`p-2 ${
                    isFullscreen
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
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
                {/* 播放/暂停 */}
                <button
                  onClick={handlePlayPause}
                  className={`p-2 ${
                    isFullscreen
                      ? "text-white hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
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
                {/* 下一首 */}
                <button
                  className={`p-2 ${
                    isFullscreen
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
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

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs tabular-nums ${
                    isFullscreen ? "text-gray-300" : "text-gray-500"
                  } w-10 text-right`}
                >
                  {formatTime(currentTime)}
                </span>
                <div
                  className="flex-1 group relative"
                  onMouseEnter={() => setIsHoveringProgress(true)}
                  onMouseLeave={() => setIsHoveringProgress(false)}
                >
                  <div
                    className={`h-1 ${
                      isFullscreen ? "bg-white/20" : "bg-gray-200"
                    } rounded-full`}
                  >
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                    <div
                      className={`h-full ${
                        isFullscreen ? "bg-white" : "bg-pink-500"
                      } rounded-full relative`}
                      style={{
                        width: `${(currentTime / duration) * 100 || 0}%`,
                      }}
                    >
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 ${
                          isFullscreen ? "bg-white" : "bg-pink-500"
                        } rounded-full transition-transform ${
                          isHoveringProgress ? "scale-100" : "scale-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs tabular-nums ${
                    isFullscreen ? "text-gray-300" : "text-gray-500"
                  } w-10`}
                >
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* 音量控制和全屏 */}
            <div className="flex items-center gap-6">
              {/* 音量控制 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVolume((v) => (v === 0 ? 1 : 0))}
                  className={`p-2 ${
                    isFullscreen
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-400 hover:text-gray-600"
                  } transition-colors`}
                >
                  {volume === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7L7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91c-.36.15-.58.53-.58.92c0 .72.73 1.18 1.39.91c.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87c0-3.83-2.4-7.11-5.78-8.4c-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
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
                <div className="flex items-center w-20 h-9">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={(e) =>
                      handleVolumeChange(parseFloat(e.target.value))
                    }
                    className={`w-full h-1 ${
                      isFullscreen ? "bg-white/20" : "bg-gray-200"
                    } rounded-full appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                      [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:transition-colors ${
                        isFullscreen
                          ? "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:hover:bg-gray-200"
                          : "[&::-webkit-slider-thumb]:bg-gray-500 [&::-webkit-slider-thumb]:hover:bg-gray-600"
                      }`}
                  />
                </div>
              </div>

              {/* 全屏按钮 */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 ${
                  isFullscreen
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-400 hover:text-gray-600"
                } transition-colors`}
              >
                {isFullscreen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
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
                      d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
