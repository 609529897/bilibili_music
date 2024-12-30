import { useState, useCallback, useEffect } from 'react';
import { Video, Favorite } from '../types/electron';

interface UsePlaylistProps {
  selectedFavorite: Favorite | null;
}

export const usePlaylist = ({ selectedFavorite }: UsePlaylistProps) => {
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylist = useCallback(async (favoriteId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getFavoriteVideos(favoriteId);
      if (result.success) {
        setPlaylist(result.data);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVideoSelect = useCallback((video: Video) => {
    setCurrentVideo(video);
  }, []);

  useEffect(() => {
    if (selectedFavorite) {
      loadPlaylist(selectedFavorite.id);
    } else {
      setPlaylist([]);
      setCurrentVideo(null);
    }
  }, [selectedFavorite, loadPlaylist]);

  return {
    playlist,
    currentVideo,
    isLoading,
    error,
    handleVideoSelect,
  };
};
