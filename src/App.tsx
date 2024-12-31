import { useState } from "react";
import { useFavorites } from "./hooks/useFavorites";
import { usePlaylist } from "./hooks/usePlaylist";
import { useUserInfo } from "./hooks/useUserInfo";
import { FavoritesList } from "./components/FavoritesList";
import { PlayList } from "./components/PlayList";
import { ModernPlayer } from "./components/Player";
import { LoginScreen } from "./components/LoginScreen";
import { FavoritesDialog } from "./components/FavoritesDialog";

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
    hasMore,
    loadMore,
    isLoadLoading,
    handleNext,
    handlePrevious
  } = usePlaylist({ selectedFavorite });

  const {
    isLoggedIn,
    isLoading: loginLoading,
    error: loginError,
    avatarUrl,
    userInfo,
    handleLogin,
    handleLogout,
  } = useUserInfo();

  const [isSelectingFavorites, setIsSelectingFavorites] = useState(false);

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        isLoading={loginLoading}
        error={loginError}
      />
    );
  }

  return (
    <div className="window-frame">
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
          username={userInfo?.uname}
          onLogout={handleLogout}
        />
        <PlayList
          playlist={playlist}
          currentVideo={currentVideo}
          isLoading={playlistLoading}
          error={playlistError}
          selectedFavorite={selectedFavorite?.title}
          onVideoSelect={handleVideoSelect}
          hasMore={hasMore}
          loadMore={loadMore}
          isLoadLoading={isLoadLoading}
        />
      </div>

      <ModernPlayer
        currentVideo={currentVideo}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {isSelectingFavorites && (
        <FavoritesDialog
          isOpen={isSelectingFavorites}
          favorites={favorites}
          selectedFavoriteIds={selectedFavoriteIds}
          onClose={() => setIsSelectingFavorites(false)}
          onToggleFavorite={(fav) => {
            const newIds = new Set(selectedFavoriteIds); // 直接使用当前的 selectedFavoriteIds
            if (newIds.has(fav.id)) {
              newIds.delete(fav.id); // 如果已选中，则取消选择
            } else {
              newIds.add(fav.id); // 如果未选中，则添加
            }
            setSelectedFavoriteIds(newIds); // 更新状态
          }}
          onShowAll={(ids) => {
            setSelectedFavoriteIds(ids);
          }}
        />
      )}
    </div>
  );
}
