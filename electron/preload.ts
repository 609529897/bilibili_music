import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openBilibiliLogin: () => ipcRenderer.invoke('open-bilibili-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getFavoriteVideos: (mediaId: number, currentPage?: number) => ipcRenderer.invoke('get-favorite-videos', mediaId, currentPage),
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),
  getVideoAudioUrl: (bvid: string) => ipcRenderer.invoke('get-video-audio-url', bvid),
  onLoginSuccess: (callback: () => void | Promise<void>) => {
    const cleanup = () => {
      ipcRenderer.removeListener('bilibili-login-success', callback);
    };
    ipcRenderer.on('bilibili-login-success', callback);
    return cleanup;
  },
  fetchImage: (url: string) => ipcRenderer.invoke('fetch-image', url),
  logout: () => ipcRenderer.invoke('logout'),
  proxyAudio: (url: string) => ipcRenderer.invoke('proxy-audio', url),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  createPlayerView: (bvid: string) => ipcRenderer.invoke('create-player-view', bvid),
  closePlayerView: () => ipcRenderer.invoke('close-player-view'),
  onMediaControl: (callback: (action: string) => void) => {
    const handler = (_: Electron.IpcRendererEvent, action: string) => callback(action);
    ipcRenderer.on('media-control', handler);
    return () => {
      ipcRenderer.removeListener('media-control', handler);
    };
  },
  getSeriesInfo: (bvid: string) => ipcRenderer.invoke('get-series-info', bvid),
  onVideoEnded: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('video-ended', handler);
    return () => {
      ipcRenderer.removeListener('video-ended', handler);
    };
  }
})
