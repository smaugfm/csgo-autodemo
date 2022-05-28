import { app, BrowserWindow } from 'electron';
import { setupThemeChangedEvent } from './main/misc/theme';
import log from 'electron-log';
import { setupConfigMain } from './main/config/config';
import { setupIpcMain } from './main/ipc';
import { ensureSteamPrerequisites } from './main/prerequisites/ensure';
import { Gsi } from './main/gsi/Gsi';
import { gsiPort, netConPort } from './common/types/misc';
import TypedEmitter from 'typed-emitter';
import { GsiEvents } from './main/gsi/types';
import { NetCon } from './main/netcon/NetCon';
import { Autodemo } from './main/autodemo/autodemo';
import { createStore } from './common/config';
import {
  setupInit,
  setupAboutPanel,
  setupLaunchAtLogin,
  setupMenu,
  setupAutoUpdate,
} from './main/misc/app';
import {
  findSteamLocation,
  locateCsgoFolder,
} from './main/prerequisites/steam-folders';
import { AutodemoTray } from './main/tray/AutodemoTray';
import { createdDummyWindow, createErrorWindow } from './main/window/window';

setupInit();

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

setupMenu();
setupAboutPanel();
setupLaunchAtLogin();

async function createWindow() {
  const steamLocation = findSteamLocation();
  if (steamLocation) {
    global.csgoPath = locateCsgoFolder(steamLocation);
  }

  const errors = await ensureSteamPrerequisites(steamLocation, global.csgoPath);
  log.info('errors: ', errors.join(', '));
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
    const window = createdDummyWindow();
    window.hide();
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
    global.tray = new AutodemoTray(global.csgoPath, global.autodemo);
    return window;
  } else {
    const window = await createErrorWindow(
      errors,
      MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      MAIN_WINDOW_WEBPACK_ENTRY,
    );
    window.on('closed', () => {
      global.mainWindow = undefined;
    });
    return window;
  }
}

app
  .whenReady()
  .then(async () => {
    await setupAutoUpdate();
    setupConfigMain(store);
    setupIpcMain();

    try {
      global.mainWindow = await createWindow();
    } catch (e) {
      log.error(e);
      process.exit(1);
    }

    setupThemeChangedEvent(global.mainWindow);
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
