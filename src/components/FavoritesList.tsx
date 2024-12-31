import { useEffect, useMemo } from "react";
import { UserMenu } from "./UserMenu";

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
  username?: string;
  onLogout: () => void;
  onRefresh: () => void;
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
  username,
  onLogout,
  onRefresh,
}: FavoritesListProps) => {
  // 默认选中第一个收藏夹
  useEffect(() => {
    if (!selectedFavorite && favorites.length > 0) {
      onFavoriteSelect(favorites[0]);
    }
  }, [favorites, selectedFavorite, onFavoriteSelect]);

  const favList = useMemo(() => {
    const _list = favorites.filter((fav) => selectedFavoriteIds.has(fav.id));

    if (_list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-3 text-gray-500/80 space-y-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 mb-0.5 text-gray-400/80"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <div className="text-xs">点击左上角的加号按钮</div>
          <div className="text-xs">选择要显示的收藏夹</div>
        </div>
      );
    }

    return _list.map((fav) => (
      <button
        key={fav.id}
        onClick={() => onFavoriteSelect(fav)}
        className={`w-full px-3 py-2 text-left rounded-lg transition-all no-drag
          ${
            selectedFavorite?.id === fav.id
              ? "bg-pink-500 text-white shadow-sm"
              : "text-gray-900 hover:bg-white/10"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium leading-tight truncate">
            {fav.title}
          </div>
          <div
            className={`text-xs ml-2 ${
              selectedFavorite?.id === fav.id ? "text-white/70" : "text-gray-500/70"
            }`}
          >
            {fav.count}
          </div>
        </div>
      </button>
    ));
  }, [favorites, selectedFavorite, selectedFavoriteIds, onFavoriteSelect]);

  return (
    <div className="w-64 flex flex-col h-full bg-[#F3F3F4]">
      <div className="h-4 app-drag-region" />
      <div className="px-3 py-2 flex-1 flex flex-col">
        {/* 操作按钮区域 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSelectDialog}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-900 no-drag"
              title="选择收藏夹"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
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
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-900 no-drag"
              disabled={isLoading}
              title="刷新收藏夹"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"
                />
              </svg>
            </button>
          </div>
          <UserMenu
            avatarUrl={avatarUrl || undefined}
            username={username}
            onLogout={onLogout}
          />
        </div>

        {/* 收藏夹列表区域 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30">
            <div className="space-y-0.5">
              {favorites.length === 0 && !isLoading && !error ? (
                <div className="text-gray-400 text-xs px-2 py-1.5">
                  没有找到收藏夹
                </div>
              ) : (
                favList
              )}
            </div>
            {isLoading && (
              <div className="mt-3 text-center text-xs text-pink-500/80">
                加载中...
              </div>
            )}
            {error && (
              <div className="mt-3 text-xs text-center text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
