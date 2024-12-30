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
  }, []);

  return {
    favorites,
    selectedFavorite,
    selectedFavoriteIds,
    setSelectedFavoriteIds,
    onFavoriteSelect: handleFavoriteSelect,
    loadFavorites,
    isLoading,
    error,
  };
};
