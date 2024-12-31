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
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState("");

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
      if (!currentVideo?.bvid) return;

      try {
        const result = await window.electronAPI.getVideoAudioUrl(
          currentVideo.bvid
        );
        if (!result.success || !result.data.audioUrl) {
          throw new Error(result.error || "获取音频地址失败");
        }

        const audioUrl = await window.electronAPI.proxyAudio(
          result.data.audioUrl
        );
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.muted = isMuted;
        setAudioElement(audio);
        audioRef.current = audio;

        audio.addEventListener("loadedmetadata", () => {
          setDuration(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
          setCurrentTime(audio.currentTime);
        });

        audio.addEventListener("ended", () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });

        if (isPlaying) {
          audio.play();
        }
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    handleAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [currentVideo, isPlaying, volume, isMuted]);

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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      onPrevious();
    }
  };

  const handleNext = () => {
    if (onNext) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleTimeSeek,
    handlePrevious,
    handleNext,
  };
};

export default useAudioPlayer;
