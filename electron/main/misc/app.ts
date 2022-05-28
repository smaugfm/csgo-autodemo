import { app, Menu, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import fs from 'fs';
import isDev from 'electron-is-dev';
import { autoUpdater } from 'electron-github-autoupdater';
import { config } from 'dotenv';
import log from 'electron-log';

export const assetsPath = isDev
  ? path.join(app.getAppPath(), 'assets')
  : process.resourcesPath;

export const packageJson = JSON.parse(
  fs.readFileSync(
    path.join(isDev ? app.getAppPath() : process.resourcesPath, 'package.json'),
    'utf-8',
  ),
);

export function setupInit() {
  config();
  app.setAppUserModelId(`github.${packageJson.productName}.0c75d883`);

  if (require('electron-squirrel-startup')) app.quit();
}

export async function setupAutoUpdate() {
  const updater = autoUpdater({
    owner: packageJson.owner,
    allowPrerelease: false,
    repo: packageJson.name,
    accessToken: '',
  });
  updater._headers = {};
  let updateAvailable = false;

  updater.on('checking-for-update', () => {
    log.info('[auto-update] Looking for the latest release on GitHub');
  });
  updater.on('update-available', update => {
    log.info(`[auto-update] Found a new version ${update.releaseName}`);
    updateAvailable = true;
  });
  updater.on('update-downloading', obj => {
    log.info(
      `[auto-update] Downloading progress: ${obj.downloadStatus.percent}%`,
    );
  });
  updater.on('update-downloaded', () => {
    log.info('[auto-update] Finished downloading the update');
  });
  try {
    await updater.checkForUpdates();
    if (!updateAvailable) {
      log.info('[auto-update] No new releases.');
    }
  } catch (e) {
    if (e instanceof Error) {
      log.warn(`[auto-update]: ${e.message}`);
    }
  }
  updater.removeAllListeners();
}

export function setupLaunchAtLogin() {
  if (!isDev) {
    const options = app.getLoginItemSettings();
    if (!options.openAtLogin && !isDev) {
      app.setLoginItemSettings({ openAtLogin: true });
    }
  }
}

export function setupAboutPanel() {
  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: app.getVersion(),
    copyright:
      'Developed by Dmytro Marchuk.\n' +
      'To report an issue or make a contribution go to\n' +
      'https://github.com/smaug-fm/csgo-autodemo',
    version: `Electron 18.2.3`,
    iconPath: path.join(assetsPath, 'app.png'),
  });
}

export function setupMenu() {
  if (process.platform === 'darwin') {
    const devMenu: MenuItemConstructorOptions = {
      role: 'toggleDevTools',
    };
    const template: MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { label: 'About Autodemo', role: 'about' },
          { type: 'separator' },
          { label: 'Hide Autodemo', role: 'hide' },
          { label: 'Quit Autodemo', role: 'quit' },
        ],
      },
    ];
    if (isDev)
      (template[0].submenu as MenuItemConstructorOptions[]).push(devMenu);
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
}
