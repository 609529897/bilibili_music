import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openBilibiliLogin: () => ipcRenderer.invoke('open-bilibili-login'),
  checkLoginStatus: () => ipcRenderer.invoke('check-login-status'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getFavoriteVideos: (mediaId: number) => ipcRenderer.invoke('get-favorite-videos', mediaId),
  getUserInfo: () => ipcRenderer.invoke('get-user-info'),
  getImage: (url: string) => ipcRenderer.invoke('get-image', url),
  onLoginSuccess: (callback: () => void) => ipcRenderer.on('bilibili-login-success', callback),
})
