import { useState, useCallback, useEffect } from 'react';
import { Video, Favorite } from '../types/electron';

interface UsePlaylistProps {
  selectedFavorite: Favorite | null;
}

export const usePlaylist = ({ selectedFavorite }: UsePlaylistProps) => {
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadLoading, setIsLoadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPlaylist = useCallback(async (favoriteId: number, currentPage: number = 1) => {
    setError(null);
    try {
      const result = await window.electronAPI.getFavoriteVideos(favoriteId, currentPage);
      if (result.success) {
        setPlaylist(currentPage === 1 ? result.data : prev => [...prev, ...result.data]);
        setHasMore(result.hasMore || false);
        setPage(currentPage);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
      setIsLoadLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadLoading && selectedFavorite) {
      setIsLoadLoading(true); // 设置加载状态
      loadPlaylist(selectedFavorite.id, page + 1);
    }
  }, [hasMore, isLoadLoading, selectedFavorite, loadPlaylist, page]);

  const handleVideoSelect = useCallback((video: Video) => {
    setCurrentVideo(video);
  }, []);

  const handlePrevious = useCallback(() => {
    if (!currentVideo || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(video => video.bvid === currentVideo.bvid);
    if (currentIndex > 0) {
      setCurrentVideo(playlist[currentIndex - 1]);
    }
  }, [currentVideo, playlist]);

  const handleNext = useCallback(() => {
    if (!currentVideo || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(video => video.bvid === currentVideo.bvid);
    if (currentIndex < playlist.length - 1) {
      setCurrentVideo(playlist[currentIndex + 1]);
    } else if (hasMore) {
      // 如果是最后一个视频且还有更多，加载下一页
      loadMore();
    }
  }, [currentVideo, playlist, hasMore, loadMore]);

  useEffect(() => {
    if (selectedFavorite) {
      setIsLoading(true);
      setPage(1); // 重置页码
      // 保存当前播放的视频信息
      const currentPlayingVideo = currentVideo;
      
      loadPlaylist(selectedFavorite.id, 1).then(() => {
        // 如果当前有正在播放的视频，保持不变
        if (currentPlayingVideo) {
          setCurrentVideo(currentPlayingVideo);
        }
      });
    } else {
      // 只更新播放列表，不影响当前播放
      setPlaylist([]);
    }
  }, [selectedFavorite, loadPlaylist]);

  return {
    playlist,
    currentVideo,
    isLoading,
    isLoadLoading,
    error,
    handleVideoSelect,
    handlePrevious,
    handleNext,
    loadMore,
    hasMore,
  };
};
