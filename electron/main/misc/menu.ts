import { app, Menu, MenuItemConstructorOptions } from 'electron';

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
