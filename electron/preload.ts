import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  addVideo: (url: string) => ipcRenderer.invoke('add-video', url),
  login: () => ipcRenderer.invoke('bilibili-login'),
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  getFavoriteVideos: (mediaId: number) => ipcRenderer.invoke('get-favorite-videos', mediaId),
  onLoginSuccess: (callback: () => void) => {
    ipcRenderer.on('bilibili-login-success', callback)
  },
})
