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
    <div className="h-screen flex flex-col flex-1 border-l border-gray-200">
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
          <div className="space-y-0.5 p-3">
            {playlist.map(video => (
              <div
                key={video.bvid}
                onClick={() => onVideoSelect(video)}
                className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  currentVideo?.bvid === video.bvid
                    ? 'bg-pink-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-16 h-16 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1ZTdlYiIgZD0iTTEyIDN2MTAuNTVjLS41OS0uMzQtMS4yNy0uNTUtMi0uNTVjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDRzNC0xLjc5IDQtNFY3aDRWM2gtNloiLz48L3N2Zz4=';
                    }}
                  />
                  <div className={`absolute inset-0 flex items-center justify-center rounded bg-black/40 transition-opacity ${
                    currentVideo?.bvid === video.bvid ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {currentVideo?.bvid === video.bvid ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M14 19h4V5h-4M6 19h4V5H6v14Z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M8 5v14l11-7l-11-7Z"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium line-clamp-2 ${
                    currentVideo?.bvid === video.bvid ? 'text-white' : 'text-gray-900'
                  }`}>
                    {video.title}
                  </div>
                  <div className={`text-sm mt-0.5 ${
                    currentVideo?.bvid === video.bvid ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    {video.author}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isLoading && <div className="p-4 text-pink-500">加载中...</div>}
        {error && <div className="p-4 text-red-500">{error}</div>}
      </div>
    </div>
  );
};
