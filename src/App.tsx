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
    setSelectedFavoriteIds,
    onFavoriteSelect,
    loadFavorites,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = useFavorites();

  const {
    playlist,
    isLoading: playlistLoading,
    error: playlistError,
    currentVideo,
    handleVideoSelect,
  } = usePlaylist({ selectedFavorite });

  const { avatarUrl } = useUserInfo();
  const [isSelectingFavorites, setIsSelectingFavorites] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 内容区域 */}
      <div className="content-container flex min-h-0">
        <FavoritesList
          favorites={favorites}
          selectedFavorite={selectedFavorite}
          selectedFavoriteIds={selectedFavoriteIds}
          isLoading={favoritesLoading}
          error={favoritesError}
          onFavoriteSelect={onFavoriteSelect}
          onOpenSelectDialog={() => setIsSelectingFavorites(true)}
          onRefresh={loadFavorites}
          avatarUrl={avatarUrl}
        />
        <PlayList
          playlist={playlist}
          currentVideo={currentVideo}
          isLoading={playlistLoading}
          error={playlistError}
          selectedFavorite={selectedFavorite}
          onVideoSelect={handleVideoSelect}
        />
      </div>

      {/* 播放器 */}
      <div className="player-container">
        <ModernPlayer currentVideo={currentVideo} />
      </div>

      {isSelectingFavorites && (
        <SelectFavoritesDialog
          selectedIds={selectedFavoriteIds}
          onClose={() => setIsSelectingFavorites(false)}
          onConfirm={(ids) => {
            setSelectedFavoriteIds(ids);
            setIsSelectingFavorites(false);
          }}
        />
      )}
    </div>
  );
}
