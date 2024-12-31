import { useEffect, useState } from 'react';
import { Video } from "../types/electron";
import { fetchImage } from '../utils/imageProxy';

interface PlayListProps {
  playlist: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  error: string | null;
  selectedFavorite: string | undefined;
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
    <div className="h-full flex flex-col flex-1 glass-morphism border-l border-white/20">
      <div className="h-4 app-drag-region" />
      <div className="p-3 border-b border-gray-200/50">
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
          <div className="flex items-center justify-center h-32 text-red-500 text-sm">
            {error}
          </div>
        ) : playlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-gray-400" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 9H5c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM5 15h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1s.45 1 1 1z"/>
            </svg>
            {typeof selectedFavorite === 'string' ? '收藏夹是空的' : '请选择一个收藏夹'}
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {playlist.map(video => (
              <div
                key={video.bvid}
                onClick={() => onVideoSelect(video)}
                className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all animate-fade-in
                  ${
                    currentVideo?.bvid === video.bvid
                      ? 'bg-pink-500 shadow-md'
                      : 'hover:bg-gray-100'
                  }`}
              >
                <div className="relative flex-shrink-0 rounded-md overflow-hidden">
                  <div className="w-24 h-16 bg-gray-100">
                    {loadingImages.has(video.thumbnail) ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <img 
                        src={imageUrls[video.thumbnail]}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 px-1 text-xs
                    ${currentVideo?.bvid === video.bvid ? 'text-white' : 'text-white bg-black/60'}`}>
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm line-clamp-2 ${
                    currentVideo?.bvid === video.bvid ? 'text-white' : 'text-gray-900'
                  }`}>
                    {video.title}
                  </div>
                  <div className={`mt-1 text-xs ${
                    currentVideo?.bvid === video.bvid ? 'text-white/80' : 'text-gray-500'
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
