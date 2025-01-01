import { Video } from "../types/electron"
import useAudioPlayer from "../hooks/useAudioPlayer"
import { formatTime } from "./utils"
import { useState, useRef, useEffect } from "react"
import { FullScreenPlayer } from "./FullScreenPlayer"
import { BilibiliPlayer } from "./BilibiliPlayer"

interface ModernPlayerProps {
  currentVideo: Video | null
  onPrevious?: () => void
  onNext?: () => void
}

export const ModernPlayer: React.FC<ModernPlayerProps> = ({
  currentVideo,
  onPrevious,
  onNext,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBilibiliPlayer, setShowBilibiliPlayer] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null) as {
    current: HTMLAudioElement | null
  }

  useEffect(() => {
    if (!document.getElementById("audio-element")) {
      const audio = document.createElement("audio")
      audio.id = "audio-element"
      audio.preload = "auto"
      audio.crossOrigin = "anonymous"

      // 添加更详细的错误处理
      audio.addEventListener("error", (e) => {
        const target = e.target as HTMLAudioElement
        console.error("Audio error details:", {
          error: target.error,
          networkState: target.networkState,
          readyState: target.readyState,
          currentSrc: target.currentSrc,
          src: target.src,
          errorCode: target.error?.code,
          errorMessage: target.error?.message,
        })
      })

      // 添加调试事件
      const debugEvents = [
        "loadstart",
        "durationchange",
        "loadedmetadata",
        "loadeddata",
        "progress",
        "canplay",
        "canplaythrough",
      ]

      debugEvents.forEach((event) => {
        audio.addEventListener(event, () => {
          console.log(`Audio event: ${event}`, {
            currentTime: audio.currentTime,
            duration: audio.duration,
            readyState: audio.readyState,
            networkState: audio.networkState,
            src: audio.src,
          })
        })
      })

      document.body.appendChild(audio)
      audioRef.current = audio
    }
  }, [])

  const {
    isPlaying,
    currentTime,
    thumbnailUrl,
    duration,
    volume,
    isMuted,
    isLoading,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleTimeSeek,
    handlePrevious,
    handleNext,
  } = useAudioPlayer({ currentVideo, onPrevious, onNext })

  if (!currentVideo) {
    return (
      <div className="h-24 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mb-1 opacity-80"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
            />
          </svg>
          <span className="text-sm font-medium">从列表中选择音乐开始播放</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <FullScreenPlayer
        currentVideo={currentVideo}
        isVisible={isExpanded}
        onClose={() => setIsExpanded(false)}
        audioRef={audioRef}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 shadow-2xl transition-all duration-300 h-[88px] border-t z-50 backdrop-blur-2xl ${
          isExpanded
            ? "bg-transparent border-transparent"
            : "bg-white/90 border-pink-100/50 "
        }`}
      >
        {/* <audio
          id="audio-element"
          ref={audioRef}
          preload="auto"
          crossOrigin="anonymous"
        /> */}
        <div className="flex items-center justify-between h-full px-6 max-w-[1920px] mx-auto">
          {/* Left Section: Cover and Title */}
          <div className="flex items-center space-x-3 w-1/4 min-w-[220px]">
            {isExpanded ? (
              <div
                className="relative group cursor-pointer transition-opacity duration-300 opacity-100"
                onClick={() => setIsExpanded(false)}
              >
                <div
                  className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:ring-1 group-hover:ring-white/10`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-gray-400"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
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
                    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-pink-300"
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
                  isExpanded ? "text-white" : "text-gray-900"
                } truncate group-hover:text-pink-500 transition-colors duration-150`}
              >
                {currentVideo?.title || "No track selected"}
              </div>
              <div
                className={`text-xs ${
                  isExpanded ? "text-gray-300" : "text-gray-500"
                } truncate mt-0.5 font-medium`}
              >
                {currentVideo?.author || "Unknown Artist"}
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
                    ? "text-gray-300 hover:text-pink-400"
                    : "text-gray-400 hover:text-gray-600"
                } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50`}
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
                    : "text-gray-800 hover:text-pink-500"
                } transition-all duration-150 p-2 rounded-full hover:bg-pink-50 relative group`}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-pink-400/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-150" />
                {isLoading ? (
                  <svg
                    className="animate-spin h-7 w-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : isPlaying ? (
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
                    ? "text-gray-300 hover:text-pink-400"
                    : "text-gray-400 hover:text-gray-600"
                } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50`}
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
                  isExpanded ? "text-gray-300" : "text-gray-500"
                } w-8 text-right select-none`}
              >
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 group relative h-1.5">
                <div className="absolute inset-y-0 w-full flex items-center">
                  <div
                    className={`h-[3px] w-full ${
                      isExpanded ? "bg-gray-700" : "bg-gray-200"
                    } rounded-full overflow-hidden`}
                  >
                    <div
                      className="h-full bg-pink-500 transition-all duration-150"
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
                  className="absolute h-2 w-2 bg-pink-500 rounded-full shadow-sm top-1/2 -mt-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isExpanded ? "text-gray-300" : "text-gray-500"
                } w-8 select-none`}
              >
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Section: Volume Control */}
          <div className="flex items-center justify-end w-1/4 min-w-[180px]">
            <button
              onClick={toggleMute}
              className={`${
                isExpanded
                  ? "text-gray-300 hover:text-pink-400"
                  : "text-gray-500 hover:text-gray-700"
              } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50`}
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7L7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0 0 14 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  />
                </svg>
              )}
            </button>
            <div className="w-24 group relative h-1.5 ml-2">
              <div className="absolute inset-y-0 w-full flex items-center">
                <div
                  className={`h-[3px] w-full ${
                    isExpanded ? "bg-gray-700" : "bg-gray-200"
                  } rounded-full overflow-hidden`}
                >
                  <div
                    className="h-full bg-pink-500 transition-all duration-150"
                    style={{ width: `${volume * 100}%` }}
                  />
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => handleVolumeChange(e.target.valueAsNumber)}
                className="absolute inset-y-0 w-full opacity-0 cursor-pointer"
              />
              <div
                className="absolute h-2 w-2 bg-pink-500 rounded-full shadow-sm top-1/2 -mt-1 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ left: `${volume * 100}%` }}
              />
            </div>
            {/* <button
              onClick={() => setShowBilibiliPlayer(true)}
              className={`ml-6 ${
                isExpanded
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-400 hover:text-gray-600"
              } transition-colors duration-150 p-1.5 rounded-full hover:bg-pink-50`}
              title="观看视频"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </button> */}
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
  )
}
