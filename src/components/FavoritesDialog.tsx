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
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white/90 backdrop-blur-xl rounded-2xl w-[420px] max-h-[85vh] flex flex-col shadow-2xl transition-all duration-200 transform-gpu animate-scale-in border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-7 py-5 border-b border-gray-100/80 flex items-center justify-between">
          <h2 className="text-[17px] font-medium text-gray-800 tracking-tight">选择收藏夹</h2>
          <button
            onClick={onClose}
            className="p-1.5 -m-1.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <div className="px-5 py-3 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-0.5">
            {favorites.map(fav => (
              <label 
                key={fav.id} 
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/80 rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedFavoriteIds.has(fav.id)}
                    onChange={() => onToggleFavorite(fav)}
                    className="w-[18px] h-[18px] text-pink-500 border-2 border-gray-300 rounded-md focus:ring-pink-500/20 focus:ring-offset-0 transition-all duration-200 checked:border-pink-500 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-pink-500/10 scale-0 group-hover:scale-[2] rounded-full transition-all duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[15px] text-gray-700 truncate group-hover:text-pink-600 transition-colors duration-200">
                    {fav.title}
                  </div>
                  <div className="text-[13px] text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                    {fav.count} 首音乐
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100/80 flex justify-end gap-3">
          <button
            onClick={onShowAll}
            className="px-4 h-9 text-[14px] text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
          >
            显示全部
          </button>
          <button
            onClick={onClose}
            className="px-5 h-9 bg-pink-500 text-[14px] text-white font-medium rounded-lg hover:bg-pink-600 transition-all duration-200 shadow-sm hover:shadow active:shadow-inner transform hover:-translate-y-0.5 active:translate-y-0"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
