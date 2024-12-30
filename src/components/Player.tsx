import { useEffect, useRef, useState } from 'react';
import { Video } from "../types/electron";
import { fetchImage } from '../utils/imageProxy';

interface ModernPlayerProps {
  currentVideo: Video | null;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ModernPlayer = ({ currentVideo }: ModernPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    if (currentVideo) {
      fetchImage(currentVideo.thumbnail).then(setThumbnailUrl);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (currentVideo && audioRef.current) {
      audioRef.current.play().catch(console.error);
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!currentVideo) {
    return (
      <div className="h-24 bg-white border-t border-gray-200 shadow-lg flex items-center justify-center text-gray-400">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
          </svg>
          <span className="text-lg">选择一首歌开始播放</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-24 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-screen-xl mx-auto h-full px-6">
        <div className="flex items-center gap-8 h-full">
          {/* 封面和信息 */}
          <div className="flex items-center gap-4 w-64 flex-shrink-0">
            <div className="relative group cursor-pointer" onClick={handlePlayPause}>
              <img
                src={thumbnailUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1ZTdlYiIgZD0iTTEyIDN2MTAuNTVjLS41OS0uMzQtMS4yNy0uNTUtMi0uNTVjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDRzNC0xLjc5IDQtNFY3aDRWM2gtNloiLz48L3N2Zz4='}
                alt={currentVideo.title}
                className="w-16 h-16 rounded-lg object-cover shadow-md"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5v14l11-7l-11-7Z"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 hover:text-pink-500 cursor-pointer transition-colors truncate">
                {currentVideo.title}
              </div>
              <div className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors truncate">
                {currentVideo.author}
              </div>
            </div>
          </div>

          {/* 播放控制 */}
          <div className="flex-1 flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setVolume(v => Math.max(0, v - 0.1))}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm7-4.17v14.34L5.17 15H4v-6h1.17L10 4.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
              <button
                onClick={handlePlayPause}
                className="p-3 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition-colors shadow-md hover:shadow-lg active:shadow-sm"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8 5v14l11-7l-11-7Z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setVolume(v => Math.min(1, v + 0.1))}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm7-4.17v14.34L5.17 15H4v-6h1.17L10 4.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-12 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1 bg-gray-200 rounded-lg relative group"
                onMouseEnter={() => setIsHoveringProgress(true)}
                onMouseLeave={() => setIsHoveringProgress(false)}
              >
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="h-full bg-pink-500 rounded-lg group-hover:bg-pink-600 transition-colors"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-pink-500 rounded-full shadow-md transition-opacity ${
                    isHoveringProgress ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ left: `${(currentTime / duration) * 100 || 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12">{formatTime(duration)}</span>
            </div>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-3 w-36">
            <button
              onClick={() => setVolume(v => v === 0 ? 1 : 0)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7L7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91c-.36.15-.58.53-.58.92c0 .72.73 1.18 1.39.91c.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87c0-3.83-2.4-7.11-5.78-8.4c-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <div className="flex-1 group">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-125"
              />
            </div>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentVideo.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};
