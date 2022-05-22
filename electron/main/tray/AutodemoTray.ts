import {
  Menu,
  MenuItemConstructorOptions,
  nativeImage,
  shell,
  Tray,
} from 'electron';
import log from 'electron-log';
import { Autodemo } from '../autodemo/autodemo';
import fs from 'fs';
import path from 'path';

type RecentDemo = {
  name: string;
  fullPath: string;
};

export class AutodemoTray {
  private readonly tray: Tray;
  private readonly csgoPath?: string;
  private readonly autodemo?: Autodemo;
  private readonly recentDemos: RecentDemo[];
  private readonly menu: Electron.Menu;

  constructor(iconPath: string, csgoPath?: string, autodemo?: Autodemo) {
    this.csgoPath = csgoPath;
    this.autodemo = autodemo;
    this.tray = new Tray(nativeImage.createFromPath(iconPath));
    this.recentDemos = this.lookForInitialDemos();
    this.menu = this.createMenu();

    autodemo?.on('recordingStarted', async demoName => {
      await this.addNewDemoToRecent(demoName);
    });

    this.tray.setToolTip('Autodemo');
    this.tray.setContextMenu(this.menu);
  }

  async addNewDemoToRecent(demoName: string) {
    if (!this.csgoPath) return;

    const fullPath = path.join(this.csgoPath, demoName);
    try {
      await fs.promises.stat(fullPath);
    } catch (e) {
      log.error(`Demo does not exist: ${demoName}`);
      log.error(e);
      return;
    }
    this.recentDemos.pop();
    this.recentDemos.unshift({
      name: demoName,
      fullPath,
    });
    const recent = this.menu.getMenuItemById('recent');
    if (recent && this.csgoPath) {
      recent.submenu = Menu.buildFromTemplate(
        this.buildRecentDemosSubmenu(this.csgoPath),
      );
      this.tray.setContextMenu(this.menu);
    }
  }

  lookForInitialDemos(): RecentDemo[] {
    if (!this.autodemo) return [];

    return this.autodemo
      .existingDemos(false)
      .slice(0, 10)
      .map(x => ({
        name: path.parse(x).base,
        fullPath: x,
      }));
  }

  createMenu() {
    const recentSubmenu = this.csgoPath
      ? this.buildRecentDemosSubmenu(this.csgoPath)
      : [];

    return Menu.buildFromTemplate([
      { label: 'About Autodemo', role: 'about' },
      { type: 'separator' },
      {
        label: 'Recent Demos',
        id: 'recent',
        submenu: recentSubmenu,
        click: () => shell.showItemInFolder(log.transports.file.getFile().path),
      },
      {
        label: 'Open Log',
        click: () => shell.showItemInFolder(log.transports.file.getFile().path),
      },
      { type: 'separator' },
      { label: 'Quit Autodemo', role: 'quit' },
    ]);
  }

  buildRecentDemosSubmenu(csgoPath: string): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = this.recentDemos.map(i => ({
      label: i.name,
      click: () => shell.showItemInFolder(i.fullPath),
    }));
    items.unshift({
      label: 'Open Demos Location',
      click: () =>
        shell.showItemInFolder(
          this.recentDemos?.[0]?.fullPath ?? path.join(csgoPath, 'bin'),
        ),
    });

    return items;
  }
}
