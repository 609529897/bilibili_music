import { useRef, useState, useCallback } from 'react';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const adjustVolume = useCallback((delta: number) => {
    setVolume(prev => Math.max(0, Math.min(1, prev + delta)));
  }, []);

  return {
    audioRef,
    isPlaying,
    setIsPlaying,
    volume,
    currentTime,
    duration,
    handleTimeUpdate,
    handleLoadedMetadata,
    togglePlay,
    adjustVolume,
  };
};
