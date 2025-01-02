import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import wxQRCode from "../assets/wx.jpeg";
interface UserMenuProps {
  avatarUrl?: string;
  username?: string;
  onLogout: () => void;
}

export function UserMenu({ avatarUrl, username, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-6 h-6" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "rounded-full overflow-hidden w-full h-full",
          "ring-2 ring-offset-2 ring-transparent",
          "hover:ring-pink-500 transition-all duration-200",
          "focus:outline-none focus:ring-pink-500"
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username || "用户头像"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"
              />
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className={clsx(
            "absolute right-0 mt-2 w-48",
            "bg-white rounded-lg shadow-lg",
            "ring-1 ring-black ring-opacity-5",
            "divide-y divide-gray-100",
            "z-50"
          )}
        >
          {username && (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900 font-medium truncate">
                {username}
              </p>
            </div>
          )}
          <div className="py-1">
            <button
              onClick={() => {
                setShowQRCode(true);
                setIsOpen(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-2 text-sm text-gray-700",
                "hover:bg-gray-50 hover:text-gray-900",
                "focus:outline-none focus:bg-gray-50 focus:text-gray-900"
              )}
            >
              联系作者
            </button>
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-2 text-sm text-gray-700",
                "hover:bg-gray-50 hover:text-gray-900",
                "focus:outline-none focus:bg-gray-50 focus:text-gray-900"
              )}
            >
              退出登录
            </button>
          </div>
        </div>
      )}

      {showQRCode && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-50"
          onClick={() => setShowQRCode(false)}
        >
          <div
            className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg max-w-xs mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={wxQRCode}
              alt="微信二维码"
              className="w-full rounded-lg"
            />
            <p className="mt-4 text-center text-gray-500/90 text-sm">
              扫码反馈或交流
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
