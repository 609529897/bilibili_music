interface UserInfo {
  uname: string;
  level: number;
  face: string;
}

export interface Video {
  bvid: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  cid: number;
  page?: number;
}

interface Favorite {
  id: number;
  title: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  hasMore?: boolean;
}

interface AudioUrlResponse {
  audioUrl: string;
}

export interface SeriesInfo {
  videos: Video[];
  currentIndex: number;
}

export interface ElectronAPI {
  openBilibiliLogin: () => Promise<void>;
  checkLoginStatus: () => Promise<boolean>;
  getFavorites: () => Promise<ApiResponse<Favorite[]>>;
  getFavoriteVideos: (mediaId: number, currentPage?: number) => Promise<ApiResponse<Video[]>>;
  getUserInfo: () => Promise<ApiResponse<UserInfo>>;
  getVideoAudioUrl: (bvid: string) => Promise<ApiResponse<{ audioUrl: string }>>;
  onLoginSuccess: (callback: () => void | Promise<void>) => () => void;
  fetchImage: (url: string) => Promise<string>;
  logout: () => Promise<ApiResponse<void>>;
  proxyAudio: (url: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  closeWindow: () => Promise<void>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  createPlayerView: (bvid: string) => Promise<void>;
  closePlayerView: () => Promise<void>;
  onMediaControl: (callback: (action: string) => void) => () => void;
  getSeriesInfo: (bvid: string) => Promise<ApiResponse<SeriesInfo>>;
  getEpisodeInfo: (bvid: string) => Promise<ApiResponse<SeriesInfo>>;
  onVideoEnded: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export { UserInfo, Video, Favorite, AudioUrlResponse, ElectronAPI };
