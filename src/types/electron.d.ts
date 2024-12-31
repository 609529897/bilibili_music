interface UserInfo {
  uname: string;
  level: number;
  face: string;
}

interface Video {
  id: number;
  bvid: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
}

interface Favorite {
  id: number;
  title: string;
  count: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  hasMore?: boolean;
}

interface AudioUrlResponse {
  audioUrl: string;
}

interface ElectronAPI {
  openBilibiliLogin: () => Promise<void>;
  checkLoginStatus: () => Promise<boolean>;
  getFavorites: () => Promise<ApiResponse<Favorite[]>>;
  getFavoriteVideos: (id: number, currentPage?: number) => Promise<ApiResponse<Video[]>>;
  getUserInfo: () => Promise<ApiResponse<UserInfo>>;
  getVideoAudioUrl: (bvid: string) => Promise<ApiResponse<AudioUrlResponse>>;
  onLoginSuccess: (callback: () => void) => void;
  fetchImage: (url: string) => Promise<string>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  proxyAudio: (url: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { UserInfo, Video, Favorite, AudioUrlResponse, ElectronAPI };
