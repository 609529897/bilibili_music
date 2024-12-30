import { useEffect, useState } from 'react';
import { Video } from "../types/electron";
import { fetchImage } from '../utils/imageProxy';

interface PlayListProps {
  playlist: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  error: string | null;
  selectedFavorite: string | null;
  onVideoSelect: (video: Video) => void;
}

interface ImageCache {
  [key: string]: string;
}

export const PlayList = ({
  playlist,
  currentVideo,
  isLoading,
  error,
  selectedFavorite,
  onVideoSelect,
}: PlayListProps) => {
  const [imageUrls, setImageUrls] = useState<ImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // 预加载图片
  useEffect(() => {
    const loadImages = async () => {
      const newImageUrls: ImageCache = {};
      const newLoadingImages = new Set<string>();
      
      for (const video of playlist) {
        if (!imageUrls[video.thumbnail]) {
          newLoadingImages.add(video.thumbnail);
        }
      }
      setLoadingImages(newLoadingImages);

      for (const video of playlist) {
        if (!imageUrls[video.thumbnail]) {
          newImageUrls[video.thumbnail] = await fetchImage(video.thumbnail);
          setLoadingImages(prev => {
            const next = new Set(prev);
            next.delete(video.thumbnail);
            return next;
          });
        }
      }
      setImageUrls(prev => ({ ...prev, ...newImageUrls }));
    };

    loadImages();
  }, [playlist]);

  return (
    <div className="h-full flex flex-col flex-1 border-l border-gray-200">
      <div className="h-4 app-drag-region" />
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">
            {typeof selectedFavorite === 'string' ? selectedFavorite : '播放列表'}
          </span>
          <span className="text-sm text-gray-500">{playlist.length} 个视频</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            加载中...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            {error}
          </div>
        ) : playlist.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            {typeof selectedFavorite === 'string' ? '收藏夹是空的' : '请选择一个收藏夹'}
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
                    src={imageUrls[video.thumbnail] || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2U1ZTdlYiIgZD0iTTEyIDN2MTAuNTVjLS41OS0uMzQtMS4yNy0uNTUtMi0uNTVjLTIuMjEgMC00IDEuNzktNCA0czEuNzkgNCA0IDRzNC0xLjc5IDQtNFY3aDRWM2gtNloiLz48L3N2Zz4='}
                    alt={video.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  {loadingImages.has(video.thumbnail) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded">
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
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
      </div>
    </div>
  );
};
