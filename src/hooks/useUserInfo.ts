import { useState, useEffect } from 'react';
import { UserInfo } from '../types/electron';
import { fetchImage } from '../utils/imageProxy';

export const useUserInfo = () => {
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
        if (result.data.face) {
          const imageUrl = await fetchImage(result.data.face);
          setAvatarUrl(imageUrl);
        }
      } else {
        setError(result.error || "Failed to load user info");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user info");
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

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.logout();
      if (result.success) {
        setIsLoggedIn(false);
        setUserInfo(null);
        setAvatarUrl(null);
      } else {
        setError(result.error || "Failed to logout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
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

  return {
    isLoggedIn,
    isLoading,
    error,
    userInfo,
    avatarUrl,
    handleLogin,
    handleLogout
  };
};
