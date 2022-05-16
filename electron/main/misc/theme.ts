import { BrowserWindow, nativeTheme } from 'electron';

export function setupThemeChangedEvent(mainWindow: BrowserWindow) {
  nativeTheme.on('updated', () => {
    mainWindow.webContents.send(
      'onThemeChanged',
      nativeTheme.shouldUseDarkColors,
    );
  });
}
