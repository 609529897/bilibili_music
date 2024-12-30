import { useEffect, useRef, useState } from 'react';

interface Video {
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
  audioUrl: string;
}

interface PlayerProps {
  currentVideo: Video | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onVolumeChange: (delta: number) => void;
}

interface ModernPlayerProps {
  currentVideo: {
    title: string;
    author: string;
    thumbnail: string;
    audioUrl: string;
  } | null;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const Player = ({
  currentVideo,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onVolumeChange,
}: PlayerProps) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* 视频/封面显示区域 */}
      <div className="aspect-video bg-gray-50">
        {currentVideo ? (
          <img
            src={currentVideo.thumbnail}
            alt={currentVideo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-300" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
            </svg>
          </div>
        )}
      </div>

      {/* 播放控制区域 */}
      <div className="flex-1 p-8 flex flex-col">
        <div className="mb-6">
          <p className="text-lg text-gray-500">
            {currentVideo?.author || '选择一首歌开始播放'}
          </p>
        </div>

        {/* 进度条 */}
        <div className="mb-8">
          <div className="flex justify-between text-base text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div
              className="h-full bg-pink-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-12">
          <button
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => onVolumeChange(-0.1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          </button>
          <button
            className="p-4 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors text-white shadow-lg"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => onVolumeChange(0.1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ModernPlayer = ({ currentVideo }: ModernPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-4">
          {/* 缩略图 */}
          {currentVideo && (
            <img
              src={currentVideo.thumbnail}
              alt={currentVideo.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}

          {/* 播放控制和进度条 */}
          <div className="flex-1">
            {currentVideo ? (
              <>
                <div className="mb-2">
                  <div className="font-medium text-gray-900">{currentVideo.title}</div>
                  <div className="text-sm text-gray-500">{currentVideo.author}</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-sm text-gray-500">{formatTime(duration)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500">未选择音乐</div>
            )}
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(v => v === 0 ? 1 : 0)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {volume === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7L7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91c-.36.15-.58.53-.58.92c0 .72.73 1.18 1.39.91c.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87c0-3.83-2.4-7.11-5.78-8.4c-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-pink-500 [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={currentVideo?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};
