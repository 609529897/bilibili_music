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
        setPlaylist(prev => [...prev, ...result.data]);
        setHasMore(result.hasMore || false);
        setPage(currentPage);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
      setIsLoadLoading(false)
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

  useEffect(() => {
    if (selectedFavorite) {
    setIsLoading(true);
    loadPlaylist(selectedFavorite.id)
    } else {
      setPlaylist([]);
      setCurrentVideo(null);
    }
  }, [selectedFavorite, loadPlaylist]);

  return {
    playlist,
    currentVideo,
    isLoading,
    isLoadLoading,
    error,
    handleVideoSelect,
    loadMore,
    hasMore,
  };
};
