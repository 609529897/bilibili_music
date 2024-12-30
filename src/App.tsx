import { useState, useEffect, useRef } from 'react'

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

declare global {
  interface Window {
    electronAPI: {
      addVideo: (url: string) => Promise<{ success: boolean, data?: any }>
      openBilibiliLogin: () => Promise<void>
      onLoginSuccess: (callback: () => void) => void
      getFavorites: () => Promise<{ success: boolean, data?: Favorite[] }>
      getFavoriteVideos: (mediaId: number) => Promise<{ success: boolean, data?: Video[] }>
      getUserInfo: () => Promise<{ success: boolean, data?: UserInfo }>
      getImage: (url: string) => Promise<string | null>
      checkLoginStatus: () => Promise<boolean>
    }
  }
}

function App() {
  const [playlist, setPlaylist] = useState<Video[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSelectingFavorites, setIsSelectingFavorites] = useState(false)
  const [selectedFavoriteIds, setSelectedFavoriteIds] = useState<Set<number>>(new Set())
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

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

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      await window.electronAPI.openBilibiliLogin()
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.getFavorites()
      if (result.success) {
        console.log('Loaded favorites:', result.data)
        setFavorites(result.data)
        setError(null)
      } else {
        setError(result.error || '获取收藏夹失败')
      }
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError('加载收藏夹失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavoriteSelect = async (favorite: Favorite) => {
    setSelectedFavorite(favorite)
    setIsLoading(true)
    try {
      console.log('Loading videos for favorite:', favorite.id)
      const result = await window.electronAPI.getFavoriteVideos(favorite.id)
      console.log('Got videos result:', result)
      if (result.success) {
        console.log('Setting playlist:', result.data)
        setPlaylist(result.data)
        setError(null)
      } else {
        setError(result.error || '获取收藏夹内容失败')
      }
    } catch (err) {
      console.error('Error loading favorite videos:', err)
      setError('加载收藏夹内容失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      // 登录成功后重试添加视频
      if (false) {
        // handleAddVideo()
      }
    })
  }, [])

  const handleAddVideo = async () => {
    // if (!url.trim()) return

    // try {
    //   console.log('Adding video with URL:', url)
    //   const result = await window.electronAPI.addVideo(url)
      
    //   if (result.success && result.data) {
    //     const newVideo: Video = {
    //       id: result.data.id,
    //       title: result.data.title,
    //       author: result.data.author,
    //       duration: result.data.duration,
    //       thumbnail: result.data.thumbnail,
    //       audioUrl: result.data.audioUrl
    //     }

    //     setPlaylist(prev => [...prev, newVideo])
    //     setUrl('')
    //   } else {
    //     console.error('Failed to add video:', result.error)
    //   }
    // } catch (error) {
    //   console.error('Error adding video:', error)
    // }
  }

  useEffect(() => {
    if (!audioRef.current || !currentVideo) return

    console.log('Audio state changed:', { isPlaying, currentVideo: currentVideo.title })
    
    const audio = audioRef.current
    
    if (isPlaying) {
      console.log('Attempting to play audio:', currentVideo.audioUrl)
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
    } else {
      console.log('Pausing audio')
      audio.pause()
    }
  }, [isPlaying, currentVideo])

  useEffect(() => {
    if (!audioRef.current || !currentVideo?.audioUrl) return

    console.log('Loading new audio source:', currentVideo.audioUrl)
    
    const audio = audioRef.current
    
    const handleCanPlay = () => {
      console.log('Audio can play')
      if (isPlaying) {
        audio.play().catch(error => {
          console.error('Error auto-playing audio:', error)
        })
      }
    }

    const handleError = (e: Event) => {
      console.error('Audio error:', (e.target as HTMLAudioElement).error)
      setIsPlaying(false)
    }

    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [currentVideo?.audioUrl])

  useEffect(() => {
    if (!audioRef.current) return
    
    const newVolume = isMuted ? 0 : volume
    console.log('Setting audio volume:', newVolume)
    audioRef.current.volume = newVolume
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentVideo) return
    
    const currentTime = audioRef.current.currentTime
    const duration = currentVideo.duration
    const progress = (currentTime / duration) * 100
    
    console.log('Audio progress:', { currentTime, duration, progress })
    setCurrentTime(currentTime)
    setProgress(progress)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current || !currentVideo) return
    
    const duration = audioRef.current.duration
    
    console.log('Audio duration:', duration)
    setDuration(duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 在组件加载时获取收藏夹列表
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavoriteVideos = async (mediaId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await window.electronAPI.getFavoriteVideos(mediaId)
      if (result.success) {
        // 添加到播放列表，避免重复
        const newVideos = result.data.filter(
          (video: Video) => !playlist.some(existing => existing.bvid === video.bvid)
        )
        setPlaylist(prev => [...prev, ...newVideos])
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading favorite videos:', err)
      setError(err instanceof Error ? err.message : '加载收藏夹内容失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video)
    setIsPlaying(true)
  }

  const toggleFavoriteSelection = (favoriteId: number) => {
    setSelectedFavoriteIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(favoriteId)) {
        newSet.delete(favoriteId)
      } else {
        newSet.add(favoriteId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {!isLoggedIn ? (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-pink-500 mx-auto mb-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
            </svg>
            <p className="text-gray-500 mb-8">请先登录以继续使用</p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? '登录中...' : '登录 B 站账号'}
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          {/* 顶部可拖动区域 */}
          <div className="h-8 w-full app-drag-region" />
          <div className="flex flex-1">
            {/* 左侧收藏夹列表 */}
            <div className="w-64 border-r border-gray-200">
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSelectingFavorites(true)}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                      title="选择收藏夹"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    </button>
                    <button
                      onClick={loadFavorites}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                      disabled={isLoading}
                      title="刷新收藏夹"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                        viewBox="0 0 24 24"
                      >
                        <path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                      {favorites.length === 0 && !isLoading && !error ? (
                        <div className="text-gray-500 text-sm px-3 py-2">
                          没有找到收藏夹
                        </div>
                      ) : (
                        favorites
                          .filter(fav => selectedFavoriteIds.size === 0 || selectedFavoriteIds.has(fav.id))
                          .map(fav => (
                            <button
                              key={fav.id}
                              onClick={() => handleFavoriteSelect(fav)}
                              className={`w-full px-3 py-2 text-left rounded-lg transition-all text-gray-600 ${
                                selectedFavorite?.id === fav.id 
                                  ? 'bg-pink-500 text-white' 
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <div className="font-medium">{fav.title}</div>
                              <div className={`text-sm ${selectedFavorite?.id === fav.id ? 'text-pink-100' : 'text-gray-400'}`}>
                                {fav.count} 首音乐
                              </div>
                            </button>
                          ))
                      )}
                    </div>
                    {isLoading && <div className="mt-4 text-pink-500">加载中...</div>}
                    {error && <div className="mt-4 text-red-500">{error}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* 中间内容区域 */}
            <div className="flex-1 flex">
              {/* 播放列表 */}
              <div className="w-80 h-full flex flex-col border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                      {selectedFavorite ? selectedFavorite.title : '播放列表'}
                    </h2>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {playlist.length === 0 && !isLoading && !error ? (
                    <div className="p-4 text-gray-500">
                      {selectedFavorite ? '收藏夹是空的' : '请选择一个收藏夹'}
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {playlist.map(video => (
                        <button
                          key={video.bvid}
                          onClick={() => handleVideoSelect(video)}
                          className={`w-full p-2 text-left rounded-lg transition-all ${
                            currentVideo?.bvid === video.bvid
                              ? 'bg-pink-500 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium line-clamp-2">{video.title}</div>
                          <div className={`text-sm ${
                            currentVideo?.bvid === video.bvid ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            {video.author}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {isLoading && <div className="p-4 text-pink-500">加载中...</div>}
                  {error && <div className="p-4 text-red-500">{error}</div>}
                </div>
              </div>

              {/* 右侧播放器 */}
              <div className="flex-1 flex flex-col">
                {/* 视频/封面显示区域 */}
                <div className="aspect-video bg-gray-50">
                  {currentVideo ? (
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-300" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* 播放控制区域 */}
                <div className="flex-1 p-8 flex flex-col">
                  <div className="mb-6">
                    <p className="text-lg text-gray-500">
                      {currentVideo?.author || '选择一首歌开始播放'}
                    </p>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-8">
                    <div className="flex justify-between text-base text-gray-400 mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* 控制按钮 */}
                  <div className="flex items-center justify-center gap-12">
                    <button
                      className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setVolume(prev => Math.max(0, prev - 0.1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                    </button>
                    <button
                      className="p-4 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors text-white shadow-lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setVolume(prev => Math.min(1, prev + 0.1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

      {/* 收藏夹选择对话框 */}
      {isSelectingFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium">选择要显示的收藏夹</h2>
              <button
                onClick={() => setIsSelectingFavorites(false)}
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
                      onChange={() => toggleFavoriteSelection(fav.id)}
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
                onClick={() => setSelectedFavoriteIds(new Set())}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                显示全部
              </button>
              <button
                onClick={() => setIsSelectingFavorites(false)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
