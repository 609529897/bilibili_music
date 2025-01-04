import { useEffect, useState, useRef, useCallback } from "react";
import { Video } from "../types/electron";
import { fetchImage } from "../utils/imageProxy";
import { ApiClient } from "../utils/apiClient";

interface UseAudioPlayerProps {
  currentVideo: Video | null;
  onPrevious?: () => void;
  onNext?: () => void;
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  thumbnailUrl: string | null;
}

const initialAudioState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.5,
  isMuted: false,
  isLoading: false,
  thumbnailUrl: null,
};

const useAudioPlayer = ({ currentVideo, onPrevious, onNext }: UseAudioPlayerProps) => {
  // 状态管理
  const [audioState, setAudioState] = useState<AudioState>(initialAudioState);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef<boolean>(false);

  // 辅助函数：更新音频状态
  const updateAudioState = useCallback((updates: Partial<AudioState>) => {
    setAudioState(prev => ({ ...prev, ...updates }));
  }, []);

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.getElementById('audio-element') as HTMLAudioElement;
      if (audio) {
        console.log('Found existing audio element');
        audioRef.current = audio;
      } else {
        console.log('Creating new audio element');
        const newAudio = document.createElement('audio');
        newAudio.id = 'audio-element';
        newAudio.preload = 'auto';
        newAudio.crossOrigin = 'anonymous';
        document.body.appendChild(newAudio);
        audioRef.current = newAudio;
      }
    }

    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
    };
  }, []);

  // 辅助函数：清理音频资源
  const cleanupAudio = useCallback(() => {
    console.log('Cleaning up audio resources');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
      audio.load();
    }

    loadingRef.current = false;
    updateAudioState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
    });
  }, [updateAudioState]);

  // 加载音频URL
  const loadAudioUrl = useCallback(async (bvid: string) => {
    console.log('Loading audio URL for:', bvid);
    const videoId = bvid + (currentVideo?.page ? `?p=${currentVideo.page}` : '');
    
    const result = await ApiClient.request(
      () => window.electronAPI.getVideoAudioUrl(videoId),
      { maxRetries: 2 }
    );

    if (!result.success || !result.data.audioUrl) {
      throw new Error(result.error || "获取音频地址失败");
    }

    return await ApiClient.request(
      () => window.electronAPI.proxyAudio(result.data.audioUrl)
    );
  }, [currentVideo?.page]);

  // 处理音频播放
  const handleAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!currentVideo?.bvid || !audio) {
      console.log('No video or audio element available');
      return;
    }

    if (loadingRef.current) {
      console.log('Already loading audio, skipping');
      return;
    }

    try {
      loadingRef.current = true;
      console.log('Starting audio loading process for:', currentVideo.title);
      
      cleanupAudio();
      updateAudioState({ isLoading: true });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 设置音频属性
      audio.volume = audioState.volume;
      audio.muted = audioState.isMuted;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      // 并行加载音频URL
      const audioUrlPromise = loadAudioUrl(currentVideo.bvid);

      // 等待一小段时间确保之前的音频完全停止
      await Promise.all([
        new Promise(resolve => setTimeout(resolve, 50)),
        audioUrlPromise.then(async (audioUrl) => {
          if (abortController.signal.aborted) return;

          console.log('Got audio URL, setting up audio element');
          audio.src = audioUrl;
          audio.load();

          // 等待音频加载
          await new Promise((resolve, reject) => {
            const loadTimeout = setTimeout(() => {
              console.warn('Audio loading is taking longer than expected');
              // 5秒后发出警告，但继续等待
              setTimeout(() => {
                reject(new Error('Audio loading timeout after 8 seconds'));
              }, 3000);
            }, 5000);

            const handleCanPlay = () => {
              clearTimeout(loadTimeout);
              console.log('Audio is ready to play');
              resolve(true);
            };

            const handleLoadStart = () => {
              console.log('Audio started loading');
            };

            const handleProgress = () => {
              // 重置超时计时器，因为正在加载中
              clearTimeout(loadTimeout);
            };

            const handleError = (e: Event) => {
              clearTimeout(loadTimeout);
              const audioError = (e.target as HTMLAudioElement).error;
              reject(new Error(`Audio loading failed: ${audioError?.message || 'Unknown error'}`));
            };

            audio.addEventListener('loadstart', handleLoadStart);
            audio.addEventListener('progress', handleProgress);
            audio.addEventListener('canplay', handleCanPlay);
            audio.addEventListener('error', handleError);

            return () => {
              clearTimeout(loadTimeout);
              audio.removeEventListener('loadstart', handleLoadStart);
              audio.removeEventListener('progress', handleProgress);
              audio.removeEventListener('canplay', handleCanPlay);
              audio.removeEventListener('error', handleError);
            };
          });

          if (abortController.signal.aborted) return;

          console.log('Audio loaded, starting playback');
          await audio.play();
          
          updateAudioState({
            isPlaying: true,
            isLoading: false,
          });
          console.log('Playback started successfully');
        })
      ]);
    } catch (error) {
      console.error('Failed to load audio:', error);
      updateAudioState({ 
        isPlaying: false,
        isLoading: false 
      });
    } finally {
      loadingRef.current = false;
    }
  }, [currentVideo, audioState.volume, audioState.isMuted, cleanupAudio, updateAudioState, loadAudioUrl]);

  // 设置音频事件监听器
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('Setting up audio event listeners');

    const handlers = {
      loadedmetadata: () => {
        console.log('Audio metadata loaded:', {
          duration: audio.duration,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
          networkState: audio.networkState
        });
        updateAudioState({ duration: audio.duration });
      },
      timeupdate: () => {
        updateAudioState({ currentTime: audio.currentTime });
      },
      ended: () => {
        console.log('Audio playback ended');
        updateAudioState({
          isPlaying: false,
          currentTime: 0,
        });
        onNext?.();
      },
      error: (e: Event) => {
        const target = e.target as HTMLAudioElement;
        console.error('Audio error:', {
          error: target.error,
          networkState: target.networkState,
          readyState: target.readyState,
          src: target.src
        });
      },
      playing: () => {
        console.log('Audio playing');
        updateAudioState({ isPlaying: true });
      },
      pause: () => {
        console.log('Audio paused');
        updateAudioState({ isPlaying: false });
      }
    };

    // 添加所有事件监听器
    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [updateAudioState, onNext]);

  // 监听视频变化，自动开始播放
  useEffect(() => {
    if (currentVideo?.bvid) {
      console.log('Video changed, starting playback:', currentVideo.title);
      handleAudio().catch(error => {
        console.error('Failed to start playback:', error);
      });
    }
  }, [currentVideo?.bvid, handleAudio]);

  // 加载缩略图
  useEffect(() => {
    if (currentVideo?.thumbnail) {
      fetchImage(currentVideo.thumbnail)
        .then(url => updateAudioState({ thumbnailUrl: url }))
        .catch(console.error);
    }
  }, [currentVideo?.thumbnail, updateAudioState]);

  // 播放控制函数
  const controls = {
    togglePlay: useCallback(async () => {
      const audio = audioRef.current;
      if (!audio) return;
      
      try {
        if (audioState.isPlaying) {
          audio.pause();
        } else {
          await audio.play();
        }
      } catch (error) {
        console.error('Error toggling play state:', error);
      }
    }, [audioState.isPlaying]),

    toggleMute: useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const newMutedState = !audioState.isMuted;
      audio.muted = newMutedState;
      updateAudioState({ 
        isMuted: newMutedState,
        volume: newMutedState && audioState.volume === 0 ? 0.5 : audioState.volume 
      });
    }, [audioState.isMuted, audioState.volume, updateAudioState]),

    handleVolumeChange: useCallback((newVolume: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.volume = newVolume;
      updateAudioState({
        volume: newVolume,
        isMuted: newVolume === 0
      });
    }, [updateAudioState]),

    handleTimeSeek: useCallback((newTime: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      
      audio.currentTime = newTime;
      updateAudioState({ currentTime: newTime });
    }, [updateAudioState]),

    handlePrevious: useCallback(() => {
      cleanupAudio();
      onPrevious?.();
    }, [cleanupAudio, onPrevious]),

    handleNext: useCallback(() => {
      cleanupAudio();
      onNext?.();
    }, [cleanupAudio, onNext])
  };

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    ...audioState,
    ...controls,
  };
};

export default useAudioPlayer;
