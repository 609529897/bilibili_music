import { useState, useEffect } from 'react';
import { useFavorites } from './useFavorites';


export const useSelectFavorites = (initialSelectedIds: Set<number>) => {

  const { favorites, isLoading, error, loadFavorites } = useFavorites();
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<Set<number>>(initialSelectedIds);

  useEffect(() => {
    loadFavorites()
  },[])

  const toggleFavorite = (id: number) => {
    setSelectedFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };



  return {
    favorites,
    isLoading,
    error,
    selectedFavoriteIds,
    toggleFavorite,
    loadFavorites,
  };
};
