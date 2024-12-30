import { useState, useEffect } from "react";
import { useFavorites } from "./hooks/useFavorites";
import { usePlaylist } from "./hooks/usePlaylist";
import { useUserInfo } from "./hooks/useUserInfo";
import { FavoritesList } from "./components/FavoritesList";
import { PlayList } from "./components/PlayList";
import { SelectFavoritesDialog } from "./components/SelectFavoritesDialog";
import { ModernPlayer } from "./components/Player";

export default function App() {
  const {
    favorites,
    selectedFavorite,
    selectedFavoriteIds,
    isLoading,
    error,
    handleFavoriteSelect,
    loadFavorites,
  } = useFavorites();

  const {
    playlist,
    currentVideo,
    isLoading: playlistLoading,
    error: playlistError,
    handleVideoSelect,
  } = usePlaylist({ selectedFavorite });

  const { avatarUrl } = useUserInfo();
  const [isSelectingFavorites, setIsSelectingFavorites] = useState(false);

  useEffect(() => {
    // 初始加载收藏夹
    loadFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <FavoritesList
          favorites={favorites}
          selectedFavorite={selectedFavorite}
          selectedFavoriteIds={selectedFavoriteIds}
          isLoading={isLoading}
          error={error}
          onFavoriteSelect={handleFavoriteSelect}
          onOpenSelectDialog={() => setIsSelectingFavorites(true)}
          onRefresh={loadFavorites}
          avatarUrl={avatarUrl}
        />
        <PlayList
          playlist={playlist}
          currentVideo={currentVideo}
          selectedFavorite={selectedFavorite}
          isLoading={playlistLoading}
          error={playlistError}
          onVideoSelect={handleVideoSelect}
        />
        <div className="flex-1 border-l border-gray-200">
          {/* 主内容区域 */}
        </div>
      </div>
      <ModernPlayer currentVideo={currentVideo} />
      {isSelectingFavorites && (
        <SelectFavoritesDialog
          selectedIds={selectedFavoriteIds}
          onClose={() => setIsSelectingFavorites(false)}
        />
      )}
    </div>
  );
}
