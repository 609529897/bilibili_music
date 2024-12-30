import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  addVideo: (url: string) => ipcRenderer.invoke('add-video', url),
  login: () => ipcRenderer.invoke('bilibili-login'),
  onLoginSuccess: (callback: () => void) => {
    ipcRenderer.on('bilibili-login-success', callback)
  }
})
