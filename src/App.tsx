import { useState } from "react";
import { useFavorites } from "./hooks/useFavorites";
import { usePlaylist } from "./hooks/usePlaylist";
import { useUserInfo } from "./hooks/useUserInfo";
import { FavoritesList } from "./components/FavoritesList";
import { PlayList } from "./components/PlayList";
import { ModernPlayer } from "./components/Player";
import { LoginScreen } from "./components/LoginScreen";
import { FavoritesDialog } from "./components/FavoritesDialog";
import { DisclaimerDialog } from "./components/DisclaimerDialog";
import { SWRConfig } from 'swr';
import { ErrorBoundary } from "./components/ErrorBoundary";

const App: React.FC = () => {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return !localStorage.getItem('disclaimer-accepted')
  });

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  const handleLoginClick = async () => {
    try {
      await handleLogin();
      // 只有在登录成功后才会执行到这里
      await loadFavorites();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // 如果正在检查登录状态，显示淡入淡出文字效果
  if (loginLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="animate-[fade_2s_ease-in-out_infinite]  text-sm font-medium tracking-wider">
          LOADING...
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLogin={handleLoginClick}
          isLoading={loginLoading}
          error={loginError}
        />
        <DisclaimerDialog 
          isOpen={showDisclaimer} 
          onAccept={handleAcceptDisclaimer} 
        />
      </>
    );
  }

  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 2,
        dedupingInterval: 1000 * 60 * 5, // 5分钟内重复请求会使用缓存
      }}
    >
      <ErrorBoundary>
        <div className="window-frame">
          <div className="content-container flex min-h-0">
            {/* 收藏夹列表 */}
            <ErrorBoundary
              fallback={
                <div className="p-4">
                  <h3 className="text-red-500">收藏夹加载失败</h3>
                  <button 
                    onClick={() => loadFavorites()} 
                    className="mt-2 text-sm text-pink-500"
                  >
                    重试
                  </button>
                </div>
              }
            >
              <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block mt-10 md:mt-0 absolute md:relative z-20 h-full`}>
                <FavoritesList
                  favorites={favorites}
                  selectedFavorite={selectedFavorite}
                  selectedFavoriteIds={selectedFavoriteIds}
                  isLoading={favoritesLoading}
                  error={favoritesError}
                  onFavoriteSelect={(fav) => {
                    onFavoriteSelect(fav);
                    setIsSidebarOpen(false); // 选择后自动关闭侧边栏
                  }}
                  onOpenSelectDialog={() => setIsSelectingFavorites(true)}
                  onRefresh={loadFavorites}
                  avatarUrl={avatarUrl}
                  username={userInfo?.uname}
                  onLogout={handleLogout}
                />
              </div>
            </ErrorBoundary>

            {/* 遮罩层 - 仅在移动端显示 */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm md:hidden z-10"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* 播放列表 */}
            <div className="flex-1 flex flex-col min-w-0">
              <ErrorBoundary>
                {/* 移动端菜单按钮 */}
                {/* <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden absolute top-6 left-3 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/10 z-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                  </svg>
                </button> */}
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
              </ErrorBoundary>
            </div>
          </div>

          <ErrorBoundary>
            <ModernPlayer
              currentVideo={currentVideo}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </ErrorBoundary>

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
      </ErrorBoundary>
    </SWRConfig>
  );
}

export default App;
