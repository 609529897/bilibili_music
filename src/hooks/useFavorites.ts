import { useState, useCallback } from 'react';

interface Favorite {
  id: number;
  title: string;
  count: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<Set<number>>(new Set());
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [isSelectingFavorites, setIsSelectingFavorites] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.getFavorites();
      if (result.success) {
        setFavorites(result.data);
      } else {
        setError(result.error || '获取收藏夹失败');
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('加载收藏夹失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFavoriteSelect = useCallback(async (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setIsLoading(true);
    try {
      const result = await window.electronAPI.getFavoriteVideos(favorite.id);
      if (!result.success) {
        throw new Error(result.error || '获取收藏夹内容失败');
      }
    } catch (err) {
      console.error('Error loading favorite videos:', err);
      setError(err instanceof Error ? err.message : '加载收藏夹内容失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavoriteSelection = useCallback((id: number) => {
    setSelectedFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return {
    favorites,
    selectedFavoriteIds,
    selectedFavorite,
    isSelectingFavorites,
    isLoading,
    error,
    setSelectedFavoriteIds,
    setIsSelectingFavorites,
    loadFavorites,
    toggleFavoriteSelection,
    handleFavoriteSelect,
  };
};
