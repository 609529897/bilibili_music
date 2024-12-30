import { useEffect } from "react";
import { useUser } from "./hooks/useUser";
import { LoginScreen } from "./components/LoginScreen";
import { FavoritesList } from "./components/FavoritesList";
import { PlayList } from "./components/PlayList";
import { ModernPlayer } from "./components/ModernPlayer";
import { FavoritesDialog } from "./components/FavoritesDialog";
import { useAudio } from "./hooks/useAudio";
import { useFavorites } from "./hooks/useFavorites";
import { usePlaylist } from "./hooks/usePlaylist";

export default function App() {
  const {
    isLoggedIn,
    avatarUrl,
    error,
    isLoading,
    handleLogin,
  } = useUser();

  const { audioRef, setIsPlaying, handleTimeUpdate, handleLoadedMetadata } =
    useAudio();

  const {
    favorites,
    selectedFavoriteIds,
    selectedFavorite,
    isSelectingFavorites,
    isLoading: favoritesLoading,
    error: favoritesError,
    setSelectedFavoriteIds,
    setIsSelectingFavorites,
    loadFavorites,
    toggleFavoriteSelection,
    handleFavoriteSelect,
  } = useFavorites();

  const {
    playlist,
    currentVideo,
    isLoading: playlistLoading,
    error: playlistError,
    handleVideoSelect,
  } = usePlaylist({
    selectedFavorite,
  });

  useEffect(() => {
    // 检查登录状态
    window.electronAPI.checkLoginStatus().then((isLoggedIn) => {
      if (isLoggedIn) {
        loadFavorites();
      }
    });

    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      loadFavorites();
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {!isLoggedIn ? (
        <LoginScreen
          isLoading={isLoading}
          error={error}
          onLogin={handleLogin}
        />
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex flex-1">
            <FavoritesList
              favorites={favorites}
              selectedFavorite={selectedFavorite}
              selectedFavoriteIds={selectedFavoriteIds}
              isLoading={favoritesLoading}
              error={favoritesError}
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
            <ModernPlayer currentVideo={currentVideo} />
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        src={currentVideo?.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <FavoritesDialog
        isOpen={isSelectingFavorites}
        favorites={favorites}
        selectedFavoriteIds={selectedFavoriteIds}
        onClose={() => setIsSelectingFavorites(false)}
        onToggleFavorite={toggleFavoriteSelection}
        onShowAll={() => setSelectedFavoriteIds(new Set())}
      />
    </div>
  );
}
