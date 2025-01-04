import { useState, useEffect, useCallback } from 'react';
import { Video } from '../types/electron';

interface UsePlaylistProps {
  selectedFavorite: any;
}

interface SeriesInfo {
  videos: Video[];
  currentIndex: number;
}

interface EpisodeInfo {
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
  
  // 分开存储合集和选集信息
  const [seriesInfo, setSeriesInfo] = useState<SeriesInfo | null>(null);
  const [episodeInfo, setEpisodeInfo] = useState<EpisodeInfo | null>(null);

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

  // 加载选集信息
  const loadEpisodeInfo = useCallback(async (bvid: string) => {
    try {
      console.log('Loading episode info for:', bvid);
      const response = await window.electronAPI.getEpisodeInfo(bvid);
      console.log('Episode info response:', response);
      
      if (response.success && response.data.videos.length > 0) {
        setEpisodeInfo(response.data);
        setSeriesInfo(null); // 清除合集信息
        return true;
      }
      
      setEpisodeInfo(null);
      return false;
    } catch (error) {
      console.error('Error loading episode info:', error);
      setEpisodeInfo(null);
      return false;
    }
  }, []);

  // 加载合集信息
  const loadSeriesInfo = useCallback(async (bvid: string) => {
    try {
      console.log('Loading series info for:', bvid);
      const response = await window.electronAPI.getSeriesInfo(bvid);
      console.log('Series info response:', response);
      
      if (response.success && response.data.videos.length > 0) {
        setSeriesInfo(response.data);
        setEpisodeInfo(null); // 清除选集信息
        return true;
      }
      
      setSeriesInfo(null);
      return false;
    } catch (error) {
      console.error('Error loading series info:', error);
      setSeriesInfo(null);
      return false;
    }
  }, []);

  // 处理视频选择
  const handleVideoSelect = useCallback(async (video: Video) => {
    console.log('Selected video:', video);
    setCurrentVideo(video);
    
    // 先尝试加载选集信息
    const hasEpisodes = await loadEpisodeInfo(video.bvid);
    if (!hasEpisodes) {
      // 如果不是选集，尝试加载合集信息
      await loadSeriesInfo(video.bvid);
    }
  }, [loadEpisodeInfo, loadSeriesInfo]);

  // 处理下一个视频
  const handleNext = useCallback(() => {
    if (!currentVideo) return;

    // 如果是选集视频
    if (episodeInfo && episodeInfo.videos.length > 1) {
      const currentIndex = episodeInfo.videos.findIndex(v => 
        v.bvid === currentVideo.bvid && v.page === currentVideo.page
      );
      if (currentIndex < episodeInfo.videos.length - 1) {
        handleVideoSelect(episodeInfo.videos[currentIndex + 1]);
      }
      return;
    }

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
  }, [currentVideo, playlist, hasMore, selectedFavorite, currentPage, seriesInfo, episodeInfo]);

  // 处理上一个视频
  const handlePrevious = useCallback(() => {
    if (!currentVideo) return;

    // 如果是选集视频
    if (episodeInfo && episodeInfo.videos.length > 1) {
      const currentIndex = episodeInfo.videos.findIndex(v => 
        v.bvid === currentVideo.bvid && v.page === currentVideo.page
      );
      if (currentIndex > 0) {
        handleVideoSelect(episodeInfo.videos[currentIndex - 1]);
      }
      return;
    }

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
  }, [currentVideo, playlist, seriesInfo, episodeInfo]);

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
    seriesInfo,  // 合集信息
    episodeInfo, // 选集信息
  };
}
