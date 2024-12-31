import React from "react";
import { Video } from "../types/electron";

interface BilibiliPlayerProps {
  currentVideo: Video | null;
  onClose: () => void;
}

export const BilibiliPlayer: React.FC<BilibiliPlayerProps> = ({
  currentVideo,
  onClose,
}) => {
  if (!currentVideo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${currentVideo.bvid}&high_quality=1&danmaku=0`}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};
