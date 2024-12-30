import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  addVideo: (url: string) => ipcRenderer.invoke('add-video', url),
})
