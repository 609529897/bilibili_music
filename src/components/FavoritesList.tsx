import { useEffect } from 'react';
import { clsx } from 'clsx';
import RefreshIcon from './RefreshIcon';
import LoadingSpinner from './LoadingSpinner';

interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface FavoritesListProps {
  favorites: Favorite[];
  selectedFavorite: Favorite | null;
  selectedFavoriteIds: Set<number>;
  isLoading: boolean;
  error: string | null;
  onFavoriteSelect: (favorite: Favorite) => void;
  onOpenSelectDialog: () => void;
  avatarUrl: string | null;
  onRefresh: () => void;
  defaultAvatar: string;
}

export const FavoritesList = ({
  favorites,
  selectedFavorite,
  selectedFavoriteIds,
  isLoading,
  error,
  onFavoriteSelect,
  onOpenSelectDialog,
  avatarUrl,
  onRefresh,
  defaultAvatar,
}: FavoritesListProps) => {
  // 默认选中第一个收藏夹
  useEffect(() => {
    if (!selectedFavorite && favorites.length > 0) {
      onFavoriteSelect(favorites[0]);
    }
  }, [favorites, selectedFavorite, onFavoriteSelect]);

  return (
    <div className="w-64 border-r border-gray-200 flex flex-col">
      <div className="h-4 app-drag-region" />
      <div className="p-4 flex-1 flex flex-col">
        {/* 操作按钮区域 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSelectDialog}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="选择收藏夹"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                />
              </svg>
            </button>
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              disabled={isLoading}
              title="刷新收藏夹"
            >
              <RefreshIcon className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <img
              src={defaultAvatar}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
          )}
        </div>

        {/* 收藏夹列表区域 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {favorites.length === 0 && !isLoading && !error ? (
                <div className="text-gray-500 text-sm px-3 py-2">
                  没有找到收藏夹
                </div>
              ) : (
                favorites
                  .filter(
                    (fav) =>
                      selectedFavoriteIds.size === 0 ||
                      selectedFavoriteIds.has(fav.id)
                  )
                  .map((fav) => (
                    <button
                      key={fav.id}
                      onClick={() => onFavoriteSelect(fav)}
                      className={`w-full px-3 py-2 text-left rounded-lg transition-all text-gray-600 ${
                        selectedFavorite?.id === fav.id
                          ? "bg-pink-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-medium">{fav.title}</div>
                      <div
                        className={`text-sm ${
                          selectedFavorite?.id === fav.id
                            ? "text-pink-100"
                            : "text-gray-400"
                        }`}
                      >
                        {fav.count} 个视频
                      </div>
                    </button>
                  ))
              )}
            </div>
            {isLoading && <div className="mt-4 text-pink-500">加载中...</div>}
            {error && <div className="mt-4 text-red-500">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
