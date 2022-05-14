import { app, BrowserWindow } from 'electron';
import { setupThemeChangedEvent } from './main/themeChangedEvent';
import log from 'electron-log';
import { setupConfigMain } from './main/config';
import { setupIpcMain } from './main/ipc';
import { ensureSteamPrerequisites } from './main/steam/prerequisites/ensure';

let mainWindow: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 900,
    minHeight: 600,
    height: 700,
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: ensureSteamPrerequisites(),
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(() => {
    if (mainWindow) {
      setupThemeChangedEvent(mainWindow);
      setupConfigMain();
      setupIpcMain();
    }
  })
  .catch(e => log.error(e));

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
