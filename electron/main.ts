import { app, shell, nativeImage, Menu, BrowserWindow, Tray } from 'electron';
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
import path from 'path';
import { isDev } from './common/util';
import { setupMenu } from './main/misc/menu';

let mainWindow: BrowserWindow | undefined;
let tray: Tray | undefined;
let gsiServer: TypedEmitter<GsiEvents>;
let netconnection: NetCon;

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

app.setAboutPanelOptions({
  applicationName: app.getName(),
  applicationVersion: app.getVersion(),
  copyright:
    'Developed by Dmytro Marchuk\n' +
    'Submit PRs on Github repo: smaug-fm/csgo-autodemo',
  version: 'Electron 13.6.1',
  iconPath,
});

setupMenu();

function createTray() {
  const image = nativeImage.createFromPath(iconPath);
  const tray = new Tray(image);
  const menu = Menu.buildFromTemplate([
    { label: 'About Autodemo', role: 'about' },
    {
      label: 'Show Log',
      click: () => shell.showItemInFolder(log.transports.file.getFile().path),
    },
    { label: 'Quit Autodemo', role: 'quit' },
  ]);
  tray.setToolTip('Autodemo');
  tray.setContextMenu(menu);

  return tray;
}

async function createWindow() {
  const [errors, csgoFolder] = ensureSteamPrerequisites();
  if (errors.length === 0) {
    gsiServer = new Gsi(gsiPort, 'autodemo');
    netconnection = new NetCon(netConPort);
    void netconnection.setupConnectionLoop();
    if (csgoFolder)
      autodemo(
        netconnection,
        gsiServer,
        path.join(csgoFolder, 'csgo', 'autodemo'),
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
      mainWindow = undefined;
      log.silly(mainWindow);
    });
    return window;
  }
}

app
  .whenReady()
  .then(async () => {
    tray = await createTray();
    const mainWindow = await createWindow();
    log.silly(tray);
    log.silly(mainWindow);

    setupThemeChangedEvent(mainWindow);
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
