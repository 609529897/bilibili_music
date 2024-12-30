import { Video } from "../types/electron";

interface PlayListProps {
  playlist: Video[];
  currentVideo: Video | null;
  selectedFavorite: { title: string } | null;
  isLoading: boolean;
  error: string | null;
  onVideoSelect: (video: Video) => void;
}

export const PlayList = ({
  playlist,
  currentVideo,
  selectedFavorite,
  isLoading,
  error,
  onVideoSelect,
}: PlayListProps) => {
  return (
    <div className="w-80 h-screen flex flex-col">
      <div className="h-4 app-drag-region" />
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-900 flex items-center gap-2">
            {selectedFavorite ? selectedFavorite.title : '播放列表'}
          </h2>
        </div>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        {playlist.length === 0 && !isLoading && !error ? (
          <div className="p-4 text-gray-500">
            {selectedFavorite ? '收藏夹是空的' : '请选择一个收藏夹'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {playlist.map(video => (
              <button
                key={video.bvid}
                onClick={() => onVideoSelect(video)}
                className={`w-full p-2 text-left rounded-lg transition-all ${
                  currentVideo?.bvid === video.bvid
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium line-clamp-2">{video.title}</div>
                <div className={`text-sm ${
                  currentVideo?.bvid === video.bvid ? 'text-pink-100' : 'text-gray-400'
                }`}>
                  {video.author}
                </div>
              </button>
            ))}
          </div>
        )}
        {isLoading && <div className="p-4 text-pink-500">加载中...</div>}
        {error && <div className="p-4 text-red-500">{error}</div>}
      </div>
    </div>
  );
};
