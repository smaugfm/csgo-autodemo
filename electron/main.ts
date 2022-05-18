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
import { autodemo } from './main/Autodemo';
import { createStore } from './common/config';

let mainWindow: BrowserWindow | undefined;
let gsiServer: TypedEmitter<GsiEvents>;
let netconnection: NetCon;

const storePath = app.getPath('userData');
log.info(`\n\nStore path: ${storePath}\n\n`);
export const store = createStore(storePath);

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

log.transports.console.level = 'info';
log.transports.file.level = false;

async function createWindow() {
  const errors = ensureSteamPrerequisites();
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 900,
    minHeight: 600,
    height: 700,
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: errors,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  if (errors.length === 0) {
    gsiServer = new Gsi(gsiPort, 'autodemo');
    netconnection = new NetCon(netConPort);
    void netconnection.setupConnectionLoop();
    autodemo(netconnection, gsiServer, () => store.read('demosPath'));
  }

  await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app
  .on('ready', createWindow)
  .whenReady()
  .then(() => {
    if (mainWindow) {
      setupThemeChangedEvent(mainWindow);
      setupConfigMain(store);
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