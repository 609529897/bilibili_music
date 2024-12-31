import { useEffect, useState, useRef } from "react";
import { Video } from "../types/electron";
import { fetchImage } from "../utils/imageProxy";

interface UseAudioPlayerProps {
  currentVideo: Video | null;
  onPrevious?: () => void;
  onNext?: () => void;
}

const useAudioPlayer = ({ currentVideo, onPrevious, onNext }: UseAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // 等待并获取 audio 元素
  useEffect(() => {
    const getAudioElement = () => {
      const element = document.getElementById('audio-element') as HTMLAudioElement;
      if (element) {
        console.log('Audio element found:', element);
        setAudioElement(element);
        audioRef.current = element;
        return true;
      }
      return false;
    };

    // 如果立即获取失败，则轮询等待
    if (!getAudioElement()) {
      console.log('Audio element not found, waiting...');
      const interval = setInterval(() => {
        if (getAudioElement()) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const getThumbnailUrl = async (path: string) => {
      if (!path) return "";
      try {
        const imageUrl = await fetchImage(path);
        return imageUrl;
      } catch (error) {
        console.error("Error fetching image:", error);
        return "";
      }
    };

    const loadThumbnail = async () => {
      if (currentVideo?.thumbnail) {
        const url = await getThumbnailUrl(currentVideo.thumbnail);
        setThumbnailUrl(url);
      } else {
        setThumbnailUrl("");
      }
    };
    loadThumbnail();
  }, [currentVideo?.thumbnail]);

  useEffect(() => {
    const handleAudio = async () => {
      if (!currentVideo?.bvid || !audioElement) {
        return;
      }

      // 清理之前的音频状态
      audioElement.pause();
      audioElement.src = '';
      audioElement.load(); // 确保清除之前的状态
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      try {
        console.log('Loading audio for video:', currentVideo.bvid);
        setIsLoading(true);
        
        // 1. 首先获取音频URL
        const result = await window.electronAPI.getVideoAudioUrl(
          currentVideo.bvid
        );
        console.log('Got audio URL result:', result);
        
        if (!result.success || !result.data.audioUrl) {
          throw new Error(result.error || "获取音频地址失败");
        }

        // 2. 获取代理URL
        const audioUrl = await window.electronAPI.proxyAudio(
          result.data.audioUrl
        );
        console.log('Got proxied audio URL:', audioUrl);

        // 3. 设置音频加载处理函数
        const loadAudio = () => {
          return new Promise<void>((resolve, reject) => {
            if (!audioElement) return reject(new Error('No audio element'));

            let loadTimeout: NodeJS.Timeout;

            const cleanup = () => {
              clearTimeout(loadTimeout);
              audioElement.removeEventListener('canplay', handleCanPlay);
              audioElement.removeEventListener('error', handleError);
              audioElement.removeEventListener('loadedmetadata', handleMetadata);
            };

            const handleCanPlay = () => {
              console.log('Audio can play now');
              cleanup();
              resolve();
            };

            const handleMetadata = () => {
              console.log('Audio metadata loaded:', {
                duration: audioElement.duration,
                currentTime: audioElement.currentTime,
                readyState: audioElement.readyState,
                networkState: audioElement.networkState
              });
              setDuration(audioElement.duration);
            };

            const handleError = (e: Event) => {
              const target = e.target as HTMLAudioElement;
              console.error('Audio loading error details:', {
                error: target.error,
                networkState: target.networkState,
                readyState: target.readyState,
                currentSrc: target.currentSrc,
                src: target.src
              });
              cleanup();
              reject(new Error('Failed to load audio'));
            };

            // 设置超时
            loadTimeout = setTimeout(() => {
              cleanup();
              reject(new Error('Audio loading timeout'));
            }, 10000);

            audioElement.addEventListener('canplay', handleCanPlay);
            audioElement.addEventListener('error', handleError);
            audioElement.addEventListener('loadedmetadata', handleMetadata);

            // 设置音频属性
            audioElement.crossOrigin = 'anonymous';
            audioElement.preload = 'auto';
            audioElement.src = audioUrl;
            audioElement.volume = volume;
            audioElement.muted = isMuted;

            // 开始加载
            console.log('Starting audio load with URL:', audioUrl);
            audioElement.load();
          });
        };

        // 4. 尝试加载音频，如果失败则重试
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            await loadAudio();
            console.log('Audio loaded successfully');
            setIsLoading(false);
            
            // 设置播放相关的事件监听
            const handleTimeUpdate = () => {
              setCurrentTime(audioElement.currentTime);
            };

            const handleEnded = () => {
              console.log('Audio playback ended');
              setIsPlaying(false);
              setCurrentTime(0);
              if (onNext) {
                handleNext();
              }
            };

            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('ended', handleEnded);

            // 开始播放
            console.log('Starting playback...');
            await audioElement.play();
            console.log('Playback started successfully');
            setIsPlaying(true);

            return () => {
              audioElement.removeEventListener('timeupdate', handleTimeUpdate);
              audioElement.removeEventListener('ended', handleEnded);
            };
          } catch (error) {
            console.error(`Attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            
            // 在重试之前重置音频元素
            audioElement.pause();
            audioElement.src = '';
            audioElement.load();
            
            if (retryCount === maxRetries) {
              console.error('Max retries reached, giving up');
              setIsLoading(false);
              throw error;
            }
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

      } catch (error) {
        console.error("Error loading audio:", error);
        setIsLoading(false);
      }
    };

    handleAudio();

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
        audioElement.load();
      }
    };
  }, [currentVideo, volume, isMuted, audioElement]);

  // 在组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
        audioElement.load();
      }
    };
  }, [audioElement]);

  const togglePlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioElement) {
      audioElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (audioElement) {
      audioElement.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeSeek = (newTime: number) => {
    if (audioElement) {
      audioElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handlePrevious = () => {
    if (onPrevious) {
      setIsPlaying(false);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext) {
      setIsPlaying(false);
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      onNext();
    }
  };

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    thumbnailUrl,
    isLoading,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleTimeSeek,
    handlePrevious,
    handleNext,
  };
};

export default useAudioPlayer;
