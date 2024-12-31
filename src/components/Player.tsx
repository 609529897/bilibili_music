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
  const [isMuted, setIsMuted] = useState(false);

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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
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
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {isFullscreen ? (
        <div className="fixed inset-0 bg-pink-500 z-50">
          <div className="h-full w-full flex flex-col items-center justify-center p-8">
            {/* 全屏封面 */}
            <div className="relative">
              <div className="w-[40vh] h-[40vh] rounded-3xl overflow-hidden bg-pink-500 p-0.5 shadow-2xl">
                <div className="w-full h-full relative rounded-[calc(1.5rem-1px)] overflow-hidden bg-black/20">
                  <img
                    src={thumbnailUrl}
                    alt={currentVideo?.title}
                    className="w-full h-full object-cover"
                  />
                  {isLoadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* 音频频谱 */}
              <div className="absolute inset-x-0 -bottom-16 h-16 flex items-end justify-center gap-1 px-4 overflow-hidden">
                {Array.from({ length: 32 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-pink-500 rounded-t spectrum-bar"
                    style={{
                      '--random-height': `${30 + Math.random() * 70}%`,
                      animationDelay: `${i * 0.05}s`
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>

            {/* 控制栏 */}
            <div className="absolute bottom-0 left-0 right-0 bg-pink-500 pt-32 pb-8 px-8">
              <div className="w-full max-w-3xl mx-auto">
                {/* 标题和作者 */}
                <div className="mb-8 text-center">
                  <div className="text-white text-xl font-medium mb-2 line-clamp-1">{currentVideo?.title}</div>
                  <div className="text-white/60">{currentVideo?.author}</div>
                </div>

                {/* 进度条 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-white/60 text-sm mb-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden group">
                    <div
                      className="h-full bg-pink-500 rounded-full relative group-hover:shadow-lg transition-shadow"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform duration-200" />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 上一首 */}
                    <button
                      onClick={() => {}}
                      disabled={true}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        true ? 'text-white/80 hover:text-white hover:bg-gray-100' : 'text-white/30'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18 6l-8.5 6L18 18V6zM8 6v12H6V6h2z" />
                      </svg>
                    </button>

                    {/* 播放/暂停 */}
                    <button
                      onClick={handlePlayPause}
                      className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* 下一首 */}
                    <button
                      onClick={() => {}}
                      disabled={true}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        true ? 'text-white/80 hover:text-white hover:bg-gray-100' : 'text-white/30'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* 音量控制 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setVolume((v) => (v === 0 ? 1 : 0))}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-gray-100 transition-colors"
                      >
                        {volume === 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      <div className="w-24 group">
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500 rounded-full group-hover:shadow-lg transition-shadow"
                            style={{ width: `${volume * 100}%` }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="absolute w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 全屏按钮 */}
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-gray-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-24 glass-morphism border-t border-white/10">
          <div className="h-full px-8">
            <div className="h-full max-w-7xl mx-auto flex items-center gap-8">
              {/* 封面和信息 */}
              <div className="flex items-center gap-4 w-80">
                <div className="relative group">
                  <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-pink-500 p-0.5">
                    <div className="w-full h-full relative rounded-[calc(0.75rem-1px)] overflow-hidden bg-black/20">
                      <img
                        src={thumbnailUrl}
                        alt={currentVideo?.title}
                        className="w-full h-full object-cover"
                      />
                      {isLoadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 hover:bg-black/40 transition-all duration-200 group-hover:opacity-100 opacity-0"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate hover:text-pink-500 cursor-pointer transition-colors">
                    {currentVideo?.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate hover:text-gray-600 cursor-pointer transition-colors">
                    {currentVideo?.author}
                  </div>
                </div>
              </div>

              {/* 播放控制 */}
              <div className="flex-1 flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center justify-center gap-6">
                  {/* 上一首 */}
                  <button 
                    onClick={() => {}}
                    disabled={true}
                    className={`p-2 transition-colors ${
                      true ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18 6l-8.5 6L18 18V6zM8 6v12H6V6h2z" />
                    </svg>
                  </button>
                  {/* 播放/暂停 */}
                  <button
                    onClick={handlePlayPause}
                    className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8 5.14v14l11-7l-11-7z" />
                      </svg>
                    )}
                  </button>
                  {/* 下一首 */}
                  <button
                    onClick={() => {}}
                    disabled={true}
                    className={`p-2 transition-colors ${
                      true ? 'text-gray-600 hover:text-gray-900' : 'text-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-gray-500 w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  <div
                    className="flex-1 group relative"
                    onMouseEnter={() => setIsHoveringProgress(true)}
                    onMouseLeave={() => setIsHoveringProgress(false)}
                  >
                    <div className="h-1 bg-gray-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full relative group-hover:shadow-lg transition-shadow"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      >
                        <div
                          className={`absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full transition-transform duration-200
                            bg-pink-500 shadow-lg ${
                            isHoveringProgress ? "scale-100" : "scale-0"
                          }`}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-gray-500 w-10">
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
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {volume === 0 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex items-center w-20 h-9 group">
                    <div className="w-full h-1 bg-gray-200/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full group-hover:shadow-lg transition-shadow"
                        style={{ width: `${volume * 100}%` }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="absolute w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 全屏按钮 */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
