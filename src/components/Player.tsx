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
