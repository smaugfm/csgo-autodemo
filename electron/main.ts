import { app, BrowserWindow } from 'electron';
import { setupThemeChangedEvent } from './main/misc/theme';
import log from 'electron-log';
import { setupConfigMain } from './main/config';
import { setupIpcMain } from './main/ipc';
import { ensureSteamPrerequisites } from './main/prerequisites/ensure';
import { Gsi } from './main/gsi/Gsi';
import { gsiPort, netConPort } from './common/types/misc';
import TypedEmitter from 'typed-emitter';
import { GsiEvents } from './main/gsi/types';
import { NetCon } from './main/netcon/NetCon';
import { Autodemo } from './main/autodemo/autodemo';
import { createStore } from './common/config';
import path from 'path';
import { isDev } from './common/util';
import { setupMenu } from './main/misc/menu';
import {
  findSteamLocation,
  locateCsgoFolder,
} from './main/prerequisites/steam-folders';
import { AutodemoTray } from './main/tray/AutodemoTray';

const global: Partial<{
  mainWindow: BrowserWindow;
  tray: AutodemoTray;
  csgoPath: string;
  gsiServer: TypedEmitter<GsiEvents>;
  netconnection: NetCon;
  autodemo: Autodemo;
}> = {
  mainWindow: undefined,
  csgoPath: undefined,
  tray: undefined,
  gsiServer: undefined,
  netconnection: undefined,
  autodemo: undefined,
};

log.info(`${app.getName()} version ${app.getVersion()}`);

const storePath = app.getPath('userData');
log.info(`\n\nStore path: ${storePath}\n\n`);
export const store = createStore(storePath);

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

log.transports.console.level = 'info';
log.transports.file.level = 'info';

const assetsPath = isDev()
  ? path.join(app.getAppPath(), 'assets')
  : process.resourcesPath;
const iconPath = path.join(assetsPath, 'app.png');

setupMenu(iconPath);

async function createWindow() {
  const steamLocation = findSteamLocation();
  if (steamLocation) {
    global.csgoPath = locateCsgoFolder(steamLocation);
  }

  const errors = ensureSteamPrerequisites(steamLocation, global.csgoPath);
  if (errors.length === 0) {
    global.gsiServer = new Gsi(gsiPort, 'autodemo');
    global.netconnection = new NetCon(netConPort);
    void global.netconnection.setupConnectionLoop();
    if (global.csgoPath)
      global.autodemo = new Autodemo(
        global.netconnection,
        global.gsiServer,
        global.csgoPath,
      );
    const window = new BrowserWindow({
      width: 300,
      height: 450,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        // Prevents renderer process code from not running when window is hidden
        backgroundThrottling: true,
      },
    });
    window.hide();
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
    return window;
  } else {
    const window = new BrowserWindow({
      width: 550,
      height: 250,
      minWidth: 550,
      minHeight: 250,
      show: true,
      webPreferences: {
        devTools: isDev(),
        nodeIntegration: false,
        contextIsolation: true,
        additionalArguments: errors,
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });

    await window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    window.on('closed', () => {
      global.mainWindow = undefined;
    });
    return window;
  }
}

app
  .whenReady()
  .then(async () => {
    global.mainWindow = await createWindow();
    global.tray = new AutodemoTray(iconPath, global.csgoPath, global.autodemo);

    setupThemeChangedEvent(global.mainWindow);
    setupConfigMain(store);
    setupIpcMain();
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
