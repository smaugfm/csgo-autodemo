import { app, Menu, MenuItemConstructorOptions } from 'electron';
import { isDev } from './os';

export function setupLaunchAtLogin() {
  const options = app.getLoginItemSettings();
  if (!options.openAtLogin && !isDev()) {
    app.setLoginItemSettings({ openAtLogin: true });
  }
}

export function setupAboutPanel(iconPath: string) {
  app.setAboutPanelOptions({
    applicationName: app.getName(),
    applicationVersion: app.getVersion(),
    copyright:
      'Developed by Dmytro Marchuk.\n' +
      'To report an issue or make a contribution go to\n' +
      'https://github.com/smaug-fm/csgo-autodemo',
    version: `Electron 18.2.3`,
    iconPath,
  });
}

export function setupMenu() {
  if (process.platform === 'darwin') {
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
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } else {
    Menu.setApplicationMenu(null);
  }
}
