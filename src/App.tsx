import { useState, useEffect, useRef } from 'react'

interface Video {
  id: string
  bvid: string
  title: string
  artist: string
  duration: number
  thumbnail: string
  audioUrl: string
  favTitle?: string
}

declare global {
  interface Window {
    electronAPI: {
      addVideo: (url: string) => Promise<{ success: boolean, data?: any }>
      login: () => Promise<void>
      onLoginSuccess: (callback: () => void) => void
      getFavorites: () => Promise<{ success: boolean, data?: Video[] }>
    }
  }
}

function App() {
  const [url, setUrl] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      // 登录成功后重试添加视频
      if (url) {
        handleAddVideo()
      }
    })
  }, [])

  const handleAddVideo = async () => {
    if (!url.trim()) return

    try {
      console.log('Adding video with URL:', url)
      const result = await window.electronAPI.addVideo(url)
      
      if (result.success && result.data) {
        const newVideo: Video = {
          id: Date.now().toString(),
          bvid: result.data.bvid,
          title: result.data.title,
          artist: result.data.author,
          duration: result.data.duration,
          thumbnail: result.data.thumbnail,
          audioUrl: result.data.audioUrl
        }

        setVideos(prev => [...prev, newVideo])
        setUrl('')
      } else {
        console.error('Failed to add video:', result.error)
      }
    } catch (error) {
      console.error('Error adding video:', error)
    }
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
    
    const newVolume = isMuted ? 0 : volume / 100
    console.log('Setting audio volume:', newVolume)
    audioRef.current.volume = newVolume
  }, [volume, isMuted])

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentVideo) return
    
    const currentTime = audioRef.current.currentTime
    const duration = currentVideo.duration
    const progress = (currentTime / duration) * 100
    
    console.log('Audio progress:', { currentTime, duration, progress })
    setProgress(progress)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 加载收藏列表
  const loadFavorites = async () => {
    try {
      setIsLoading(true)
      console.log('Starting to load favorites...')
      const result = await window.electronAPI.getFavorites()
      console.log('Got favorites result:', result)
      
      if (result.success && result.data) {
        console.log(`Adding ${result.data.length} videos to playlist`)
        setVideos(prev => {
          // 过滤掉重复的视频
          const newVideos = result.data.filter(
            newVideo => !prev.some(existingVideo => existingVideo.bvid === newVideo.bvid)
          )
          console.log(`Adding ${newVideos.length} new videos (filtered duplicates)`)
          return [...prev, ...newVideos]
        })
      } else {
        console.error('Failed to load favorites:', result.error)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      // 登录成功后加载收藏列表
      loadFavorites()
      // 如果有待添加的视频，也添加
      if (url) {
        handleAddVideo()
      }
    })
  }, [])

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="输入B站视频链接..."
              className="w-full px-4 py-2 pr-28 rounded-full border border-gray-300 focus:outline-none focus:border-purple-500"
            />
            <div className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2">
              <button
                onClick={loadFavorites}
                disabled={isLoading}
                className="px-4 py-1.5 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition-all hover:shadow-md disabled:opacity-50"
              >
                {isLoading ? '加载中...' : '导入收藏'}
              </button>
              <button
                onClick={handleAddVideo}
                className="px-4 py-1.5 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition-all hover:shadow-md"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          {/* 播放列表 */}
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={`${video.bvid}-${video.favTitle || 'custom'}`}
                className={`p-3 rounded-lg transition-all cursor-pointer ${
                  currentVideo?.bvid === video.bvid
                    ? 'bg-purple-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setCurrentVideo(video)
                  setIsPlaying(true)
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatTime(video.duration)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      UP主: {video.artist}
                    </p>
                    {video.favTitle && (
                      <p className="text-xs text-purple-500 mt-1">
                        收藏夹: {video.favTitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentVideo?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          console.log('Audio playback ended')
          setIsPlaying(false)
        }}
        onError={(e) => {
          console.error('Audio element error:', e)
          setIsPlaying(false)
        }}
      />
    </div>
  )
}

export default App
