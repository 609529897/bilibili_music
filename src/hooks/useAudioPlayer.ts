import { useEffect, useState, useRef, useCallback } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);

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
    if (audioElement) {
      audioElement.volume = volume;
      audioElement.muted = isMuted;
    }
  }, [volume, isMuted, audioElement]);

  const handleSeek = useCallback(async (newTime: number) => {
    if (!audioElement) return;

    try {
      audioElement.currentTime = newTime;
      if (isPlaying) {
        await audioElement.play();
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [audioElement, isPlaying]);

  useEffect(() => {
    const handleAudio = async () => {
      if (!currentVideo?.bvid || !audioElement) {
        return;
      }

      // 如果有正在进行的加载过程，取消它
      if (abortControllerRef.current) {
        console.log('Aborting previous audio loading...');
        abortControllerRef.current.abort();
      }

      // 创建新的 AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 清理之前的音频状态
      audioElement.pause();
      audioElement.removeAttribute('src');
      audioElement.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      try {
        console.log('Loading audio for video:', currentVideo.bvid);
        setIsLoading(true);

        // 检查是否已被取消
        if (abortController.signal.aborted) {
          console.log('Audio loading aborted');
          return;
        }
        
        const result = await window.electronAPI.getVideoAudioUrl(
          currentVideo.bvid
        );
        
        // 再次检查是否已被取消
        if (abortController.signal.aborted) {
          console.log('Audio loading aborted after getting URL');
          return;
        }

        console.log('Got audio URL result:', result);
        
        if (!result.success || !result.data.audioUrl) {
          throw new Error(result.error || "获取音频地址失败");
        }

        const audioUrl = await window.electronAPI.proxyAudio(
          result.data.audioUrl
        );

        // 再次检查是否已被取消
        if (abortController.signal.aborted) {
          console.log('Audio loading aborted after getting proxy URL');
          return;
        }

        console.log('Got proxied audio URL:', audioUrl);

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
              if (abortController.signal.aborted) {
                cleanup();
                reject(new Error('Audio loading aborted'));
                return;
              }

              console.log('Audio can play now');
              cleanup();
              resolve();
            };

            const handleMetadata = () => {
              if (!abortController.signal.aborted) {
                console.log('Audio metadata loaded:', {
                  duration: audioElement.duration,
                  currentTime: audioElement.currentTime,
                  readyState: audioElement.readyState,
                  networkState: audioElement.networkState
                });
                setDuration(audioElement.duration);
              }
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
            console.log('Starting audio load...');
            audioElement.load();
          });
        };

        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            if (abortController.signal.aborted) {
              console.log('Audio loading aborted before retry');
              return;
            }

            await loadAudio();
            console.log('Audio loaded successfully');
            setIsLoading(false);
            
            const handleTimeUpdate = () => {
              if (!abortController.signal.aborted) {
                setCurrentTime(audioElement.currentTime);
              }
            };

            const handleEnded = () => {
              if (!abortController.signal.aborted) {
                console.log('Audio playback ended');
                setIsPlaying(false);
                setCurrentTime(0);
                if (onNext) {
                  onNext();
                }
              }
            };

            audioElement.addEventListener('timeupdate', handleTimeUpdate);
            audioElement.addEventListener('ended', handleEnded);

            if (abortController.signal.aborted) {
              console.log('Audio loading aborted before playback');
              return;
            }

            // 开始播放
            if (isPlaying) {
              console.log('Starting playback...');
              await audioElement.play();
              console.log('Playback started successfully');
            }

            return () => {
              audioElement.removeEventListener('timeupdate', handleTimeUpdate);
              audioElement.removeEventListener('ended', handleEnded);
            };
          } catch (error) {
            if (abortController.signal.aborted) {
              console.log('Audio loading aborted during retry');
              return;
            }

            console.error(`Attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            
            audioElement.pause();
            audioElement.removeAttribute('src');
            audioElement.load();
            
            if (retryCount === maxRetries) {
              console.error('Max retries reached, giving up');
              setIsLoading(false);
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading audio:", error);
          setIsLoading(false);
        }
      }
    };

    handleAudio();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      if (audioElement) {
        audioElement.pause();
        audioElement.removeAttribute('src');
        audioElement.load();
      }
    };
  }, [currentVideo, audioElement]);

  useEffect(() => {
    if (!audioElement) return;

    const playAudio = async () => {
      try {
        if (isPlaying) {
          await audioElement.play();
        } else {
          audioElement.pause();
        }
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [isPlaying, audioElement]);

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
    handleSeek,
  };
};

export default useAudioPlayer;
