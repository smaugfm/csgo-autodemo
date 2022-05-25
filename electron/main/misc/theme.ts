import { BrowserWindow, nativeTheme } from 'electron';

export function setupThemeChangedEvent(mainWindow: BrowserWindow) {
  if (process.platform === 'darwin') {
    nativeTheme.on('updated', () => {
      mainWindow.webContents.send(
        'onThemeChanged',
        nativeTheme.shouldUseDarkColors,
      );
    });
  }
}
