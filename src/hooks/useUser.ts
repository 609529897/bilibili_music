import { useState, useEffect } from 'react';
import { UserInfo } from '../types/electron';

export const useUser = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const loadUserInfo = async () => {
    try {
      const result = await window.electronAPI.getUserInfo();
      if (result.success) {
        setUserInfo(result.data);
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await window.electronAPI.openBilibiliLogin();
      setIsLoggedIn(true);
      await loadUserInfo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 检查登录状态
    window.electronAPI.checkLoginStatus().then((isLoggedIn) => {
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        loadUserInfo();
      }
    });

    // 监听登录成功事件
    window.electronAPI.onLoginSuccess(() => {
      setIsLoggedIn(true);
      loadUserInfo();
    });
  }, []);

  useEffect(() => {
    if (userInfo?.face) {
      window.electronAPI.getImage(userInfo.face).then((url) => {
        if (url) {
          setAvatarUrl(url);
        }
      });
    }
  }, [userInfo?.face]);

  return {
    isLoggedIn,
    avatarUrl,
    error,
    isLoading,
    userInfo,
    handleLogin,
    loadUserInfo,
  };
};
