import { useState, useEffect } from 'react';
import { useSelectFavorites } from '../hooks/useSelectFavorites';

interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface SelectFavoritesDialogProps {
  selectedIds: Set<number>;
  onClose: () => void;
  onConfirm: (ids: Set<number>) => void;
}

export const SelectFavoritesDialog = ({
  selectedIds,
  onClose,
  onConfirm,
}: SelectFavoritesDialogProps) => {
  const {
    favorites,
    isLoading,
    error,
    selectedFavoriteIds,
    toggleFavorite,
  } = useSelectFavorites(selectedIds);

  const handleConfirm = () => {
    onConfirm(selectedFavoriteIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">选择收藏夹</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 收藏夹列表 */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              {error}
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map(favorite => (
                <button
                  key={favorite.id}
                  onClick={() => toggleFavorite(favorite.id)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedFavoriteIds.has(favorite.id)
                      ? 'bg-pink-50 text-pink-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFavoriteIds.has(favorite.id)}
                      onChange={() => toggleFavorite(favorite.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium truncate">{favorite.title}</div>
                      <div className="text-sm text-gray-500">{favorite.count} 个视频</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
