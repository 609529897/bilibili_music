interface UserInfo {
  uname: string;
  face: string;
  level: number;
}

interface Video {
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
  audioUrl: string;
}

interface Favorite {
  id: number;
  title: string;
  count: number;
}

declare global {
  interface Window {
    electronAPI: {
      getUserInfo: () => Promise<{ success: boolean; data: UserInfo }>;
      getImage: (url: string) => Promise<string | null>;
      openBilibiliLogin: () => Promise<void>;
      getFavorites: () => Promise<{
        success: boolean;
        data: Favorite[];
        error?: string;
      }>;
      getFavoriteVideos: (id: number) => Promise<{
        success: boolean;
        data: Video[];
        error?: string;
      }>;
      addVideo: (url: string) => Promise<{ success: boolean; data?: any }>;
      onLoginSuccess: (callback: () => void) => void;
      checkLoginStatus: () => Promise<boolean>;
    };
  }
}

export { UserInfo, Video, Favorite };
