import { useState, useCallback } from 'react';

interface Video {
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
  audioUrl: string;
}

export const usePlaylist = () => {
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSelect = useCallback((video: Video) => {
    setCurrentVideo(video);
  }, []);

  const loadPlaylist = useCallback(async (favoriteId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Your existing loadPlaylist logic here
      // This is just a placeholder - you'll need to implement the actual API call
      const response = await fetch(`/api/playlist/${favoriteId}`);
      const data = await response.json();
      setPlaylist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    playlist,
    currentVideo,
    isLoading,
    error,
    handleVideoSelect,
    loadPlaylist,
  };
};
