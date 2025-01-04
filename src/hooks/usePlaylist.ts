import { useState, useEffect, useCallback } from 'react';
import { Video } from '../types/electron';

interface UsePlaylistProps {
  selectedFavorite: any;
}

interface SeriesInfo {
  videos: Video[];
  currentIndex: number;
}

export function usePlaylist({ selectedFavorite }: UsePlaylistProps) {
  const [playlist, setPlaylist] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadLoading, setIsLoadLoading] = useState(false);
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);

  // 加载收藏夹视频
  const loadFavoriteVideos = useCallback(async (mediaId: number, page: number = 1) => {
    try {
      setIsLoadLoading(true);
      const response = await window.electronAPI.getFavoriteVideos(mediaId, page);
      if (response.success) {
        if (page === 1) {
          setPlaylist(response.data);
        } else {
          setPlaylist(prev => [...prev, ...response.data]);
        }
        setHasMore(response.hasMore ?? false);
        setCurrentPage(page);
      } else {
        setError(response.error ?? 'Failed to load videos');
      }
    } catch (error) {
      setError('Failed to load videos');
    } finally {
      setIsLoadLoading(false);
    }
  }, []);

  // 加载合集信息
  const loadSeriesInfo = useCallback(async (bvid: string) => {
    try {
      console.log('Loading series info for:', bvid);
      const response = await window.electronAPI.getSeriesInfo(bvid);
      console.log('Series info response:', response);
      
      if (response.success) {
        setSeriesInfo(response.data);
      } else {
        console.error('Failed to load series info:', response.error);
        setSeriesInfo(null);
      }
    } catch (error) {
      console.error('Error loading series info:', error);
      setSeriesInfo(null);
    }
  }, []);

  // 处理视频选择
  const handleVideoSelect = useCallback(async (video: Video) => {
    console.log('Selected video:', video);
    setCurrentVideo(video);
    // 加载合集信息
    await loadSeriesInfo(video.bvid);
  }, [loadSeriesInfo]);

  // 处理下一个视频
  const handleNext = useCallback(() => {
    if (!currentVideo) return;

    // 如果是合集视频
    if (seriesInfo && seriesInfo.videos.length > 1) {
      const currentIndex = seriesInfo.videos.findIndex(v => v.bvid === currentVideo.bvid);
      if (currentIndex < seriesInfo.videos.length - 1) {
        handleVideoSelect(seriesInfo.videos[currentIndex + 1]);
      }
      return;
    }

    // 如果是普通播放列表
    const currentIndex = playlist.findIndex(v => v.bvid === currentVideo.bvid);
    if (currentIndex < playlist.length - 1) {
      handleVideoSelect(playlist[currentIndex + 1]);
    } else if (hasMore) {
      loadFavoriteVideos(selectedFavorite.id, currentPage + 1);
    }
  }, [currentVideo, playlist, hasMore, selectedFavorite, currentPage, seriesInfo]);

  // 处理上一个视频
  const handlePrevious = useCallback(() => {
    if (!currentVideo) return;

    // 如果是合集视频
    if (seriesInfo && seriesInfo.videos.length > 1) {
      const currentIndex = seriesInfo.videos.findIndex(v => v.bvid === currentVideo.bvid);
      if (currentIndex > 0) {
        handleVideoSelect(seriesInfo.videos[currentIndex - 1]);
      }
      return;
    }

    // 如果是普通播放列表
    const currentIndex = playlist.findIndex(v => v.bvid === currentVideo.bvid);
    if (currentIndex > 0) {
      handleVideoSelect(playlist[currentIndex - 1]);
    }
  }, [currentVideo, playlist, seriesInfo]);

  // 监听视频结束事件
  useEffect(() => {
    const cleanup = window.electronAPI.onVideoEnded(() => {
      handleNext();
    });
    return cleanup;
  }, [handleNext]);

  // 加载初始播放列表
  useEffect(() => {
    if (selectedFavorite?.id) {
      setIsLoading(true);
      loadFavoriteVideos(selectedFavorite.id)
        .finally(() => setIsLoading(false));
    }
  }, [selectedFavorite, loadFavoriteVideos]);

  const loadMore = useCallback(() => {
    if (selectedFavorite?.id && hasMore && !isLoadLoading) {
      loadFavoriteVideos(selectedFavorite.id, currentPage + 1);
    }
  }, [selectedFavorite, hasMore, isLoadLoading, currentPage]);

  return {
    playlist,
    currentVideo,
    isLoading,
    error,
    handleVideoSelect,
    hasMore,
    loadMore,
    isLoadLoading,
    handleNext,
    handlePrevious,
    seriesInfo,  // 添加合集信息
  };
}
