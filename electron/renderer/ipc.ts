import { ipcRenderer } from 'electron';

export function setupIpcRenderer() {
  return {
    saveGsiFileDialog: () => ipcRenderer.invoke('saveGsiFileDialog'),
  };
}
