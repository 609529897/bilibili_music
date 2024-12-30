interface UserInfo {
  uname: string;
  level: number;
}

interface Video {
  id: number;
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
}

interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ElectronAPI {
  openBilibiliLogin: () => Promise<void>;
  checkLoginStatus: () => Promise<boolean>;
  getFavorites: () => Promise<Favorite[]>;
  getFavoriteVideos: (id: number) => Promise<Video[]>;
  getUserInfo: () => Promise<UserInfo>;
  getVideoAudioUrl: (bvid: string) => Promise<string>;
  onLoginSuccess: (callback: () => void) => void;
  fetchImage: (url: string) => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { UserInfo, Video, Favorite, ElectronAPI };
