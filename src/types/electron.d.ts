interface UserInfo {
  uname: string;
  face: string;
  level: number;
}

interface Video {
  bvid: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  audioUrl?: string;
}

interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface AudioUrlResponse {
  audioUrl: string;
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

export { UserInfo, Video, Favorite, AudioUrlResponse, ElectronAPI };
