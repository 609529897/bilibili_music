import { useState, useCallback, useEffect } from 'react';

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
      if (result.success && result.data) {
        setFavorites(result.data);
        setSelectedFavoriteIds(new Set(result.data.map(f => f.id)));
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

  // 当用户选择收藏夹时
  const handleSetSelectedFavoriteIds = useCallback((ids: Set<number>) => {
    setSelectedFavoriteIds(ids);
    if (ids.size > 0) {
      const firstId = Array.from(ids)[0];
      const firstFavorite = favorites.find(f => f.id === firstId);
      if (firstFavorite) {
        setSelectedFavorite(firstFavorite);
      }
    }
  }, [favorites]);

  const handleFavoriteSelect = useCallback(async (favorite: Favorite) => {
    setSelectedFavorite(favorite);
  }, []);

  // 组件挂载时自动加载收藏夹
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    selectedFavorite,
    selectedFavoriteIds,
    setSelectedFavoriteIds: handleSetSelectedFavoriteIds,
    onFavoriteSelect: handleFavoriteSelect,
    loadFavorites,
    isLoading,
    error,
  };
};
