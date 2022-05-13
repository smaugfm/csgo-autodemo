import { app, BrowserWindow } from 'electron';
import { setupThemeChangedEvent } from './main/themeChangedEvent';
import log from 'electron-log';
import { setupConfigMain } from './main/config';
import { createStore } from './common/config';
import { locateCsgo } from './main/steam/locateCsgo';
import { checkAndInstallGSIFile } from './main/steam/checkAndInstallGSIFile';

let mainWindow: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const storePath = app.getPath('userData');
log.info(`\n\nStore path: ${storePath}\n\n`);

const store = createStore(storePath);

async function createWindow() {
  const args = [`storePath:${storePath}`];

  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 900,
    minHeight: 600,
    height: 700,
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: args,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  const location = locateCsgo();
  if (location) {
    await store.write('csgoLocation', location);
    log.info(location);
    checkAndInstallGSIFile(location);
  }

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
      setupConfigMain(mainWindow, store);
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
