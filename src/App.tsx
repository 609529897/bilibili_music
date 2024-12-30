import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { TitleBar } from './components/TitleBar';
import { FavoritesList } from './components/FavoritesList';
import { PlayList } from './components/PlayList';
import { ModernPlayer } from './components/ModernPlayer';
import { FavoritesDialog } from './components/FavoritesDialog';
import { useAudio } from './hooks/useAudio';
import { useFavorites } from './hooks/useFavorites';
import { usePlaylist } from './hooks/usePlaylist';

interface Video {
  bvid: string
  title: string
  author: string
  duration: number
  thumbnail: string
  audioUrl: string
}

interface Favorite {
  id: number
  title: string
  count: number
}

interface UserInfo {
  uname: string
  face: string
  level: number
}

interface UserInfo {
  face: string;
  // Add other user info fields as needed
}

declare global {
  interface Window {
    electronAPI: {
      getUserInfo: () => Promise<{ success: boolean; data: UserInfo }>;
      getImage: (url: string) => Promise<string | null>;
      openBilibiliLogin: () => Promise<void>;
      getFavorites: () => Promise<{ 
        success: boolean; 
        data: Array<{ id: number; title: string; count: number }>;
        error?: string;
      }>;
      getFavoriteVideos: (id: number) => Promise<{
        success: boolean;
        data: Array<{
          bvid: string;
          title: string;
          author: string;
          thumbnail: string;
          audioUrl: string;
        }>;
        error?: string;
      }>;
      addVideo: (url: string) => Promise<{ success: boolean, data?: any }>
      onLoginSuccess: (callback: () => void) => void
      checkLoginStatus: () => Promise<boolean>
    }
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const {
    audioRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    handleTimeUpdate,
    handleLoadedMetadata,
    togglePlay,
    adjustVolume,
  } = useAudio();

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
  } = usePlaylist();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await window.electronAPI.openBilibiliLogin();
      setIsLoggedIn(true);
      await loadUserInfo(); // Load user info after successful login
      await loadFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 检查登录状态
    window.electronAPI.checkLoginStatus().then(isLoggedIn => {
      setIsLoggedIn(isLoggedIn)
      if (isLoggedIn) {
        loadUserInfo()
        loadFavorites()
      }
    })

    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      setIsLoggedIn(true)
      loadUserInfo()
      loadFavorites()
    })
  }, [])

  const loadUserInfo = async () => {
    try {
      const result = await window.electronAPI.getUserInfo()
      if (result.success) {
        setUserInfo(result.data)
      }
    } catch (err) {
      console.error('Failed to load user info:', err)
    }
  }

  useEffect(() => {
    if (userInfo?.face) {
      window.electronAPI.getImage(userInfo.face).then(url => {
        if (url) {
          setAvatarUrl(url)
        }
      })
    }
  }, [userInfo?.face])

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
