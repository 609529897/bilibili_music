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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>
        <button
          onClick={() => window.open(`https://www.bilibili.com/video/${currentVideo.bvid}`)}
          className="absolute top-4 right-14 text-white/80 hover:text-white transition-colors duration-150"
          title="在 B 站打开"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7z"
            />
          </svg>
        </button>
        <iframe
          src={`https://player.bilibili.com/player.html?bvid=${currentVideo.bvid}&high_quality=1&danmaku=0&autoplay=1&theater=1&t=0&p=1&as_wide=1&widescale=1&webfullscreen=1`}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
        />
      </div>
    </div>
  );
};
