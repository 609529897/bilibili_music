import React, { useEffect, useCallback } from "react";
import { Video } from "../types/electron";

interface BilibiliPlayerProps {
  currentVideo: Video | null;
  onClose: () => void;
}

export const BilibiliPlayer: React.FC<BilibiliPlayerProps> = ({
  currentVideo,
  onClose,
}) => {
  // 处理 ESC 键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!currentVideo?.bvid) return;

    // 创建播放器视图
    window.electronAPI.createPlayerView(currentVideo.bvid);
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      window.electronAPI.closePlayerView();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentVideo?.bvid, handleKeyDown]);

  if (!currentVideo) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in"
      />

      {/* 播放器容器 */}
      <div 
        className="relative flex-1 animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        {/* 控制按钮 */}
        <div 
          className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 hover:opacity-100 transition-opacity duration-200"
        >
          {/* B 站按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.electronAPI.openExternal(`https://www.bilibili.com/video/${currentVideo.bvid}`);
            }}
            className="text-white/80 hover:text-white transition-colors duration-150 p-2 rounded-full hover:bg-white/10"
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

          {/* 关闭按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/80 hover:text-white transition-colors duration-150 p-2 rounded-full hover:bg-white/10"
            title="关闭 (ESC)"
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
        </div>
      </div>
    </div>
  );
};
