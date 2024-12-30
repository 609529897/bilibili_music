import { useState } from 'react'
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid'

interface Video {
  id: string
  title: string
  url: string
}

declare global {
  interface Window {
    electronAPI: {
      addVideo: (url: string) => Promise<{ success: boolean }>
    }
  }
}

function App() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [url, setUrl] = useState('')

  const handleAddVideo = async () => {
    if (!url) return

    try {
      const result = await window.electronAPI.addVideo(url)
      if (result.success) {
        // For now, we'll just add a simple object
        const newVideo: Video = {
          id: Date.now().toString(),
          title: 'New Video', // This should be extracted from the URL
          url,
        }
        setVideos([...videos, newVideo])
        setUrl('')
      }
    } catch (error) {
      console.error('Error adding video:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bilibili Music Player</h1>
        
        {/* Add Video Form */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter Bilibili video URL"
            className="flex-1 px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddVideo}
            className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Add Video
          </button>
        </div>

        {/* Player Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">
              {currentVideo?.title || 'No video selected'}
            </h2>
          </div>
          <div className="flex justify-center items-center gap-4">
            <button className="p-2 hover:text-blue-500">
              <BackwardIcon className="h-8 w-8" />
            </button>
            <button 
              className="p-2 hover:text-blue-500"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <PauseIcon className="h-12 w-12" />
              ) : (
                <PlayIcon className="h-12 w-12" />
              )}
            </button>
            <button className="p-2 hover:text-blue-500">
              <ForwardIcon className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">Playlist</h3>
          {videos.length === 0 ? (
            <p className="text-gray-400 text-center">No videos added yet</p>
          ) : (
            <div className="space-y-2">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer"
                  onClick={() => setCurrentVideo(video)}
                >
                  <span>{video.title}</span>
                  <span className="text-gray-400 text-sm">
                    {video.url.substring(0, 30)}...
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
