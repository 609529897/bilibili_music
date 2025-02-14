import { useEffect, useState, useRef } from "react";
import { Video } from "../types/electron";
import { fetchImage } from "../utils/imageProxy";

interface PlayListProps {
  playlist: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  isLoadLoading: boolean;
  error: string | null;
  selectedFavorite: string | undefined;
  onVideoSelect: (video: Video) => void;
  hasMore: boolean; // 添加 hasMore 属性
  loadMore: () => void; // 添加 loadMore 属性
}

interface ImageCache {
  [key: string]: {
    url: string;
    error: boolean;
  };
}

export const PlayList = ({
  playlist,
  currentVideo,
  isLoading,
  isLoadLoading,
  error,
  selectedFavorite,
  onVideoSelect,
  hasMore, // 添加 hasMore 属性
  loadMore, // 添加 loadMore 属性
}: PlayListProps) => {
  const [imageCache, setImageCache] = useState<ImageCache>({});
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // 加载单个图片
  const loadImage = async (thumbnail: string) => {
    if (imageCache[thumbnail]?.url || loadingImages.has(thumbnail)) {
      return;
    }

    try {
      setLoadingImages((prev) => new Set(prev).add(thumbnail));
      const url = await fetchImage(thumbnail);
      setImageCache((prev) => ({
        ...prev,
        [thumbnail]: { url, error: false },
      }));
    } catch (error) {
      console.error("Failed to load image:", thumbnail, error);
      setImageCache((prev) => ({
        ...prev,
        [thumbnail]: { url: "", error: true },
      }));
    } finally {
      setLoadingImages((prev) => {
        const next = new Set(prev);
        next.delete(thumbnail);
        return next;
      });
    }
  };

  // 预加载可见的图片
  useEffect(() => {
    playlist.forEach((video) => {
      if (video.thumbnail) {
        loadImage(video.thumbnail);
      }
    });
  }, [playlist]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore) {
        loadMore();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loadMore, hasMore]);

  return (
    <div className="h-full flex flex-col flex-1 bg-white">
      <div className="px-4 md:h-14 h-20 flex items-center justify-between w-full border-b border-gray-200/50 app-drag-region">
        <div className="flex items-center justify-between w-full app-drag-region">
          <span className="text-gray-700 font-medium">
            {typeof selectedFavorite === "string"
              ? selectedFavorite
              : "播放列表"}
          </span>
          <span className="text-sm text-gray-500">
            {playlist.length} 个视频
          </span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <svg
              className="animate-spin h-5 w-5 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            加载中...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-500 text-sm">
            {error}
          </div>
        ) : playlist.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[240px] text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4 opacity-80"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
              />
            </svg>
            <div className="text-base font-medium mb-1">
              {typeof selectedFavorite === "string"
                ? "收藏夹是空的"
                : "请选择一个收藏夹"}
            </div>
            <div className="text-sm opacity-60">
              {typeof selectedFavorite === "string"
                ? "快去 B 站收藏一些音乐吧"
                : "从左侧选择一个收藏夹开始播放"}
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {playlist.map((video) => (
              <div
                key={video.bvid}
                onClick={() => onVideoSelect(video)}
                className={`group flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all animate-fade-in
                  ${
                    currentVideo?.bvid === video.bvid
                      ? "bg-pink-500 shadow-md"
                      : "hover:bg-gray-100"
                  }`}
              >
                <div className="relative flex-shrink-0 rounded-md overflow-hidden">
                  <div className="w-24 h-16 bg-gray-100">
                    {loadingImages.has(video.thumbnail) ? (
                      <div className="w-full h-full">
                        <div className="w-full h-full bg-gray-50 animate-pulse opacity-50" />
                      </div>
                    ) : imageCache[video.thumbnail]?.error ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-8 h-8 text-gray-400"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                          />
                        </svg>
                      </div>
                    ) : imageCache[video.thumbnail]?.url ? (
                      <img
                        src={imageCache[video.thumbnail].url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 px-1 text-xs
                    ${
                      currentVideo?.bvid === video.bvid
                        ? "text-white"
                        : "text-white bg-black/60"
                    }`}
                  >
                    {Math.floor(video.duration / 60)}:
                    {(video.duration % 60).toString().padStart(2, "0")}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-sm line-clamp-2 ${
                      currentVideo?.bvid === video.bvid
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {video.title}
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      currentVideo?.bvid === video.bvid
                        ? "text-white/80"
                        : "text-gray-500"
                    }`}
                  >
                    {video.author}
                  </div>
                </div>
              </div>
            ))}
            {isLoadLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                加载中...
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};