import { useEffect, useCallback } from 'react';

interface UseMediaSessionProps {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onSeek?: (time: number) => void;
}

export const useMediaSession = ({
  title,
  artist,
  album,
  artwork,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onSeek
}: UseMediaSessionProps) => {
  const setMetadata = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || '未知标题',
        artist: artist || '未知作者',
        album: album || 'BiliMusic',
        artwork: artwork ? [
          {
            src: artwork,
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ] : undefined
      });
    }
  }, [title, artist, album, artwork]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      // 设置媒体控制处理程序
      navigator.mediaSession.setActionHandler('play', onPlay || null);
      navigator.mediaSession.setActionHandler('pause', onPause || null);
      navigator.mediaSession.setActionHandler('previoustrack', onPrevious || null);
      navigator.mediaSession.setActionHandler('nexttrack', onNext || null);
      navigator.mediaSession.setActionHandler('seekto', event => {
        if (event.seekTime && onSeek) {
          onSeek(event.seekTime);
        }
      });

      // 设置元数据
      setMetadata();
    }

    return () => {
      if ('mediaSession' in navigator) {
        // 清理处理程序
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('seekto', null);
      }
    };
  }, [onPlay, onPause, onPrevious, onNext, onSeek, setMetadata]);
}; 