import { app, Menu, MenuItemConstructorOptions } from 'electron';
import path from 'path';
import fs from 'fs';
import isDev from 'electron-is-dev';

export const assetsPath = isDev
  ? path.join(app.getAppPath(), 'assets')
  : process.resourcesPath;

export const packageJson = JSON.parse(
  fs.readFileSync(
    path.join(isDev ? app.getAppPath() : process.resourcesPath, 'package.json'),
    'utf-8',
  ),
);

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
