import { useState, useEffect, useCallback } from "react";
import { fetchImage } from "../utils/imageProxy";
import { UserInfo } from "../types/electron";

export const useUserInfo = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const loadUserInfo = useCallback(async () => {
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
  }, []);

  // 检查登录状态
  const checkLoginStatus = useCallback(async () => {
    try {
      const isLoggedIn = await window.electronAPI.checkLoginStatus();
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        await loadUserInfo();
      }
      return isLoggedIn;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check login status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadUserInfo]);

  // 初始化时检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);



  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setIsLoggedIn(false);
      await window.electronAPI.openBilibiliLogin();
      
      await new Promise<void>((resolve, reject) => {
        const cleanup = window.electronAPI.onLoginSuccess(async () => {
          try {
            const isLoggedIn = await checkLoginStatus();
            if (isLoggedIn) {
              resolve();
            } else {
              reject(new Error('Login failed'));
            }
          } catch (error) {
            reject(error);
          } finally {
            cleanup();
          }
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      setIsLoggedIn(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
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
