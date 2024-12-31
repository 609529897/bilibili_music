import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openBilibiliLogin: () => ipcRenderer.invoke('open-bilibili-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getFavoriteVideos: (mediaId: number) => ipcRenderer.invoke('get-favorite-videos', mediaId),
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),
  getVideoAudioUrl: (bvid: string) => ipcRenderer.invoke('get-video-audio-url', bvid),
  onLoginSuccess: (callback: () => void) => ipcRenderer.on('bilibili-login-success', callback),
  fetchImage: (url: string) => ipcRenderer.invoke('fetch-image', url),
  logout: () => ipcRenderer.invoke('logout'),
})
