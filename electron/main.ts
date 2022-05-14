import { app, BrowserWindow } from 'electron';
import { setupThemeChangedEvent } from './main/themeChangedEvent';
import log from 'electron-log';
import { setupConfigMain } from './main/config';
import { setupIpcMain } from './main/ipc';
import { ensureSteamPrerequisites } from './main/steam/prerequisites/ensure';
import { CsGoGsi } from './main/steam/gsi/CsGoGsi';
import { gsiPort, netConPort } from './common/types/misc';
import TypedEmitter from 'typed-emitter';
import { CsGoGsiEVents } from './main/steam/gsi/types';
import { NetConnection } from './main/steam/netcon/NetConnection';

let mainWindow: BrowserWindow | null = null;
let gsiServer: TypedEmitter<CsGoGsiEVents> | null = null;
let netconnection: NetConnection | null = null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

async function createWindow() {
  const args = ensureSteamPrerequisites();
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
  if (args.includes('gsiInstalled')) {
    gsiServer = new CsGoGsi(gsiPort, 'autodemo');
    netconnection = new NetConnection();
    gsiServer.on('all', state => {
      log.info('gsi: ', state);
    });
    await netconnection.connect(netConPort);
    netconnection.on('console', message => {
      log.info('netcon: ', message);
    });
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
