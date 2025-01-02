import { useState, useCallback } from 'react';
import { Video, Favorite } from '../types/electron';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';
import { ApiClient } from '../utils/apiClient';

interface UsePlaylistProps {
  selectedFavorite: Favorite | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  hasMore?: boolean;
}

interface PlaylistResponse {
  playlist: Video[];
  currentVideo: Video | null;
  isLoading: boolean;
  isLoadLoading: boolean;
  error: string | null;
  handleVideoSelect: (video: Video) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

export const usePlaylist = ({ selectedFavorite }: UsePlaylistProps): PlaylistResponse => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const getKey: SWRInfiniteKeyLoader = (pageIndex: number) => {
    if (!selectedFavorite) return null;
    return ['favoriteVideos', selectedFavorite.id, pageIndex + 1] as [string, number, number];
  };

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating
  } = useSWRInfinite<ApiResponse<Video[]>>(
    getKey,
    async ([_, mediaId, page]: [string, number, number]) => ApiClient.request<ApiResponse<Video[]>>(
      () => window.electronAPI.getFavoriteVideos(mediaId, page)
    ),
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      persistSize: true
    }
  );

  // 合并所有页面的视频
  const playlist = data?.flatMap(page => page.success ? page.data : []) || [];
  const hasMore = data?.[data.length - 1]?.hasMore ?? false;

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
      setSize(size + 1);
    }
  }, [currentVideo, playlist, hasMore, setSize, size]);

  return {
    playlist,
    currentVideo,
    isLoading,
    isLoadLoading: isValidating && size > 1,
    error: error ? String(error) : null,
    handleVideoSelect,
    handlePrevious,
    handleNext,
    loadMore: () => hasMore && setSize(size + 1),
    hasMore,
  };
};
