import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

interface UserMenuProps {
  avatarUrl?: string;
  username?: string;
  onLogout: () => void;
}

export function UserMenu({ avatarUrl, username, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-7 h-7" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'rounded-full overflow-hidden w-full h-full',
          'ring-2 ring-offset-2 ring-transparent',
          'hover:ring-pink-500 transition-all duration-200',
          'focus:outline-none focus:ring-pink-500'
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username || '用户头像'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" />
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={clsx(
          'absolute right-0 mt-2 w-48',
          'bg-white rounded-lg shadow-lg',
          'ring-1 ring-black ring-opacity-5',
          'divide-y divide-gray-100',
          'z-50'
        )}>
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
                onLogout();
                setIsOpen(false);
              }}
              className={clsx(
                'w-full text-left px-4 py-2 text-sm text-gray-700',
                'hover:bg-gray-50 hover:text-gray-900',
                'focus:outline-none focus:bg-gray-50 focus:text-gray-900'
              )}
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
