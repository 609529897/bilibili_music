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

declare global {
  interface Window {
    electronAPI: {
      addVideo: (url: string) => Promise<{ success: boolean, data?: any }>
      login: () => Promise<void>
      onLoginSuccess: (callback: () => void) => void
      getFavorites: () => Promise<{ success: boolean, data?: Favorite[] }>
      getFavoriteVideos: (mediaId: number) => Promise<{ success: boolean, data?: Video[] }>
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
  const audioRef = useRef<HTMLAudioElement>(null)

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
    //       bvid: result.data.bvid,
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

  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await window.electronAPI.getFavorites()
      console.log('Favorites result:', result)
      if (result.success) {
        setFavorites(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError(err instanceof Error ? err.message : '加载收藏夹失败')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleFavoriteSelect = async (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setIsLoading(true);
    try {
      const result = await window.electronAPI.getFavoriteVideos(favorite.id);
      if (result.success) {
        setPlaylist(result.data);
        setError(null);
      } else {
        setError(result.error || '获取收藏夹内容失败');
      }
    } catch (err) {
      console.error('Error loading favorite videos:', err);
      setError('加载收藏夹内容失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6">
          {/* 左侧边栏：收藏夹列表 */}
          <div className="w-1/4 border-r border-gray-200 pr-6">
            <h2 className="text-xl font-medium mb-6 flex items-center justify-between text-gray-900">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
                </svg>
                音乐收藏
              </div>
              <button
                onClick={() => {
                  setIsLoading(true);
                  window.electronAPI.getFavorites()
                    .then(result => {
                      if (result.success) {
                        setFavorites(result.data);
                        setError(null);
                      } else {
                        setError(result.error || '获取收藏夹失败');
                      }
                    })
                    .catch(err => {
                      console.error('Error refreshing favorites:', err);
                      setError('刷新收藏夹失败');
                    })
                    .finally(() => {
                      setIsLoading(false);
                    });
                }}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                disabled={isLoading}
                title="刷新收藏夹"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`}
                  viewBox="0 0 24 24"
                >
                  <path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.187-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/>
                </svg>
              </button>
            </h2>
            <div className="space-y-1">
              {favorites.length === 0 && !isLoading && !error ? (
                <div className="text-gray-500 text-sm px-3 py-2">
                  没有找到以"我的"开头的收藏夹
                </div>
              ) : (
                favorites.map(fav => (
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

          {/* 右侧主内容：播放器和播放列表 */}
          <div className="flex-1 flex flex-col">
            {/* 当前播放 */}
            <div className="mb-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg bg-gray-50">
                  {currentVideo ? (
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-medium mb-2 text-gray-900">
                    {currentVideo?.title || '未播放'}
                  </h2>
                  <p className="text-gray-500">
                    {currentVideo?.author || '选择一首歌开始播放'}
                  </p>
                  {/* 进度条 */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                  {/* 控制按钮 */}
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setVolume(prev => Math.max(0, prev - 0.1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                    </button>
                    <button
                      className="p-3 bg-pink-500 rounded-full hover:bg-pink-600 transition-colors text-white shadow-lg"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setVolume(prev => Math.min(1, prev + 0.1))}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 播放列表 */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-xl font-medium text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6Z"/>
                  </svg>
                  {selectedFavorite ? selectedFavorite.title : '播放列表'}
                </h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center text-gray-500 py-8">
                    加载中...
                  </div>
                ) : playlist.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {selectedFavorite ? '当前收藏夹暂无内容' : '从左侧选择一个收藏夹'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {playlist.map((video) => (
                      <div
                        key={video.bvid}
                        className={`p-3 rounded-lg transition-all cursor-pointer ${
                          currentVideo?.bvid === video.bvid
                            ? 'bg-pink-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-gray-900">
                              {video.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {video.author} · {formatTime(video.duration)}
                            </div>
                          </div>
                          {currentVideo?.bvid === video.bvid && (
                            <div className="text-pink-500">
                              {isPlaying ? '正在播放' : '已暂停'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentVideo?.audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  )
}

export default App
