import { useState, useEffect, useRef } from 'react'
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon
} from '@heroicons/react/24/solid'

interface Video {
  id: string
  bvid: string
  title: string
  artist: string
  duration: number
  thumbnail: string
  audioUrl: string
}

declare global {
  interface Window {
    electronAPI: {
      addVideo: (url: string) => Promise<{ success: boolean, data?: { bvid: string, title: string, author: string, duration: number, thumbnail: string, audioUrl: string } }>
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
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleAddVideo = async () => {
    if (!url.trim()) return

    try {
      console.log('Adding video with URL:', url)
      const result = await window.electronAPI.addVideo(url)
      console.log('API response:', result)
      
      if (result.success && result.data) {
        console.log('Video data received:', result.data)
        
        const newVideo: Video = {
          id: Date.now().toString(),
          bvid: result.data.bvid,
          title: result.data.title,
          artist: result.data.author,
          duration: result.data.duration,
          thumbnail: result.data.thumbnail,
          audioUrl: result.data.audioUrl
        }

        console.log('Created new video object:', newVideo)
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Bilibili Music
        </h1>
        <div className="flex items-center">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Bilibili URL"
              className="w-[360px] px-4 py-2 pr-20 rounded-full bg-gray-50/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm placeholder:text-gray-400"
            />
            <button
              onClick={handleAddVideo}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-500 text-white text-sm rounded-full hover:bg-purple-600 transition-all hover:shadow-md"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Main Player Section */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50">
          {/* Album Art */}
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="relative w-[420px] aspect-square rounded-3xl overflow-hidden shadow-2xl group">
              <img 
                src={currentVideo?.thumbnail || 'https://via.placeholder.com/400?text=Select+a+Track'} 
                alt="Album Art"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </div>

          {/* Controls Section */}
          <div className="h-52 px-8 py-6 flex flex-col justify-center bg-white/95 backdrop-blur-sm border-t border-gray-100">
            {/* Track Info */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-1.5">
                {currentVideo?.title || 'No track selected'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentVideo?.artist || 'Select a track to play'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-400 tabular-nums w-10">{formatTime(progress / 100 * currentVideo?.duration)}</span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full relative transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-400 tabular-nums w-10 text-right">
                  {currentVideo ? formatTime(currentVideo.duration) : '0:00'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-8">
              <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                <BackwardIcon className="h-6 w-6" />
              </button>
              <button 
                className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full hover:shadow-xl hover:shadow-purple-100 transition-all hover:scale-105 active:scale-95"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <PauseIcon className="h-8 w-8 text-white" />
                ) : (
                  <PlayIcon className="h-8 w-8 text-white" />
                )}
              </button>
              <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors">
                <ForwardIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Playlist Section */}
        <div className="w-[360px] bg-white/95 backdrop-blur-sm border-l border-gray-100 flex flex-col">
          <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-800">Playlist</h3>
              <span className="text-xs text-gray-400">{videos.length} tracks</span>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="h-4 w-4 text-gray-400" />
              ) : (
                <SpeakerWaveIcon className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Playlist Items */}
          <div className="flex-1 p-3">
            {videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <QueueListIcon className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No tracks added yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      currentVideo?.id === video.id 
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900' 
                        : 'hover:bg-gray-50/80'
                    }`}
                    onClick={() => setCurrentVideo(video)}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{video.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{video.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
