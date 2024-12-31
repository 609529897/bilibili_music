import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openBilibiliLogin: () => ipcRenderer.invoke('open-bilibili-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getFavoriteVideos: (mediaId: number, currentPage?: number) => ipcRenderer.invoke('get-favorite-videos', mediaId, currentPage),
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),
  getVideoAudioUrl: (bvid: string) => ipcRenderer.invoke('get-video-audio-url', bvid),
  onLoginSuccess: (callback: () => void) => ipcRenderer.on('bilibili-login-success', callback),
  fetchImage: (url: string) => ipcRenderer.invoke('fetch-image', url),
  logout: () => ipcRenderer.invoke('logout'),
  // proxyAudio: (url: string) => ipcRenderer.invoke('proxy-audio', url),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
})
