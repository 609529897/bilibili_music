interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface FavoritesDialogProps {
  isOpen: boolean;
  favorites: Favorite[];
  selectedFavoriteIds: Set<number>;
  onClose: () => void;
  onToggleFavorite: (id: Favorite) => void;
  onShowAll: (ids: Set<number>) => void;
}

export const FavoritesDialog = ({
  isOpen,
  favorites,
  selectedFavoriteIds,
  onClose,
  onToggleFavorite,
  onShowAll,
}: FavoritesDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-lg rounded-xl w-[380px] max-h-[85vh] flex flex-col shadow-lg transition-all duration-200 transform-gpu animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-medium text-gray-800">
            选择收藏夹
          </h2>
          <button
            onClick={onClose}
            className="p-1 -m-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          <div className="space-y-0.5">
            {favorites.map((fav) => (
              <label
                key={fav.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedFavoriteIds.has(fav.id)}
                    onChange={() => onToggleFavorite(fav)}
                    className="w-4 h-4 text-pink-500 border-2 border-gray-300 rounded focus:ring-0 transition-colors cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700 truncate">
                    {fav.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {fav.count} 首
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={() => onShowAll(new Set(favorites.map((fav) => fav.id)))}
            className="px-3 h-8 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            显示全部
          </button>
          <button
            onClick={onClose}
            className="px-4 h-8 bg-pink-500 text-sm text-white font-medium rounded-lg hover:bg-pink-600 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
