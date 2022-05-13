import { ipcRenderer } from 'electron';

export const theming = {
  themeChanged: (handler: (mode: 'light' | 'dark') => void) => {
    ipcRenderer.on('onThemeChanged', (event, shouldUseDarkColors) => {
      handler(shouldUseDarkColors ? 'dark' : 'light');
    });
  },
};
