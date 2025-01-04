import { useRef, useState, useEffect } from 'react';
import { Video } from '../types/electron';
import { useVirtualizer } from '@tanstack/react-virtual';

interface PlayListProps {
  playlist: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  error: string | null;
  selectedFavorite: string | undefined;
  onVideoSelect: (video: Video) => void;
  hasMore: boolean;
  loadMore: () => void;
  isLoadLoading: boolean;
}

interface ImageCache {
  [key: string]: {
    url: string;
    error: boolean;
  };
}

export const PlayList: React.FC<PlayListProps> = ({
  playlist,
  currentVideo,
  isLoading,
  error,
  selectedFavorite,
  onVideoSelect,
  hasMore,
  loadMore,
  isLoadLoading,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const rowVirtualizer = useVirtualizer({
    count: playlist.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 84,
    overscan: 5,
  });

  // 加载单个图片
  const loadImage = async (thumbnail: string) => {
    if (imageCache[thumbnail]?.url || loadingImages.has(thumbnail)) {
      return;
    }

    try {
      setLoadingImages(prev => new Set(prev).add(thumbnail));
      const url = await window.electronAPI.fetchImage(thumbnail);
      setImageCache(prev => ({
        ...prev,
        [thumbnail]: { url, error: false },
      }));
    } catch (error) {
      console.error('Failed to load image:', thumbnail, error);
      setImageCache(prev => ({
        ...prev,
        [thumbnail]: { url: '', error: true },
      }));
    } finally {
      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(thumbnail);
        return next;
      });
    }
  };

  // 预加载可见的图片
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    virtualItems.forEach(virtualRow => {
      const video = playlist[virtualRow.index];
      if (video?.thumbnail) {
        loadImage(video.thumbnail);
      }
    });
  }, [playlist, rowVirtualizer.getVirtualItems()]);

  // 处理滚动到底部加载更多
  const handleScroll = () => {
    if (!scrollParentRef.current || !hasMore || isLoadLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollParentRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMore();
    }
  };

  useEffect(() => {
    const scrollElement = scrollParentRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, isLoadLoading]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-[fade_2s_ease-in-out_infinite] text-sm font-medium tracking-wider">
          LOADING...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="text-red-500">加载失败</div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-sm text-pink-500"
        >
          重试
        </button>
      </div>
    );
  }

  if (!playlist.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        暂无内容
      </div>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-full flex flex-col min-h-0 bg-gray-50/50"
    >
      {/* 标题区域 */}
      <div className="flex-none px-4 py-3 text-sm font-medium sticky top-0 z-10 text-gray-900 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
          </svg>
          {selectedFavorite || '播放列表'}
        </div>
      </div>

      {/* 列表区域 */}
      <div
        ref={scrollParentRef}
        className="flex-1 overflow-auto"
        style={{
          height: 'calc(100% - 45px)',
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const video = playlist[virtualRow.index];
            const isPlaying = currentVideo?.bvid === video.bvid;
            return (
              <div
                key={virtualRow.index}
                className={`absolute top-0 left-0 w-full ${
                  isPlaying ? 'bg-pink-50 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-pink-500' : 'hover:bg-white/80'
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  className="w-full h-full px-4 py-3 flex items-center gap-4 text-left"
                  onClick={() => onVideoSelect(video)}
                >
                  {/* 序号或播放状态 */}
                  <div className="w-8 flex-none flex items-center justify-center">
                    {isPlaying ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {virtualRow.index + 1}
                      </span>
                    )}
                  </div>

                  {/* 缩略图 */}
                  <div className="w-20 h-14 flex-none rounded overflow-hidden bg-gray-100">
                    {loadingImages.has(video.thumbnail) ? (
                      <div className="w-full h-full bg-gray-50 animate-pulse" />
                    ) : imageCache[video.thumbnail]?.error ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      </div>
                    ) : imageCache[video.thumbnail]?.url ? (
                      <img
                        src={imageCache[video.thumbnail].url}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  {/* 视频信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium truncate text-gray-900">
                      {video.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* 加载更多提示 */}
        {hasMore && (
          <div className="py-4 flex justify-center">
            {isLoadLoading ? (
              <div className="animate-[fade_2s_ease-in-out_infinite] text-sm font-medium tracking-wider">
                LOADING...
              </div>
            ) : (
              <button
                onClick={loadMore}
                className="text-sm text-pink-500"
              >
                加载更多
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}