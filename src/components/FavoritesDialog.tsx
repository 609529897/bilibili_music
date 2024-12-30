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
  onToggleFavorite: (id: number) => void;
  onShowAll: () => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium">选择要显示的收藏夹</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {favorites.map(fav => (
              <label key={fav.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFavoriteIds.has(fav.id)}
                  onChange={() => onToggleFavorite(fav.id)}
                  className="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
                />
                <div>
                  <div className="font-medium">{fav.title}</div>
                  <div className="text-sm text-gray-500">{fav.count} 首音乐</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onShowAll}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            显示全部
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
