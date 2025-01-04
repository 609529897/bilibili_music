import { useRef, useState, useEffect } from 'react';
import { Video } from '../types/electron';
import { useVirtualizer } from '@tanstack/react-virtual';

interface EpisodeListProps {
  playlist: Video[];
  currentVideo: Video | null;
  onVideoSelect: (video: Video) => void;
  seriesTitle: string;
}

interface ImageCache {
  [key: string]: {
    url: string;
    error: boolean;
  };
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  playlist,
  currentVideo,
  onVideoSelect,
  seriesTitle,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const rowVirtualizer = useVirtualizer({
    count: playlist.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 64, // 选集列表行高更小
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

  return (
    <div 
      ref={parentRef} 
      className="h-full flex flex-col overflow-hidden bg-white"
    >
      {/* 标题区域 */}
      <div className="flex-none px-4 py-3 font-medium sticky top-0 z-10 text-gray-700 border-b border-gray-100 app-drag-region">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
          {seriesTitle}
        </div>
      </div>

      {/* 列表区域 */}
      <div
        ref={scrollParentRef}
        className="flex-1 overflow-y-auto"
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
            const isPlaying = currentVideo?.bvid === video.bvid && currentVideo?.page === video.page;
            return (
              <div
                key={virtualRow.index}
                className={`absolute top-0 left-0 w-full ${
                  isPlaying ? 'bg-pink-50/60 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-pink-500' : 'hover:bg-white/50'
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <button
                  className="w-full h-full px-4 py-2 flex items-center gap-2.5 text-left"
                  onClick={() => onVideoSelect(video)}
                >
                  {/* 序号或播放状态 */}
                  <div className="w-6 flex-none flex items-center justify-center">
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-2">
                        <div className="w-0.5 h-full bg-pink-500 origin-bottom animate-bar-1" />
                        <div className="w-0.5 h-full bg-pink-500 origin-bottom animate-bar-2" />
                        <div className="w-0.5 h-full bg-pink-500 origin-bottom animate-bar-3" />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">
                        P{video.page}
                      </span>
                    )}
                  </div>

                  {/* 视频信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-gray-700">
                      {video.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 