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
import { assetsPath, packageJson } from '../misc/app';
import { delay } from '../../common/util';

export class AutodemoTray {
  private readonly tray: Tray;
  private readonly csgoPath?: string;
  private readonly autodemo?: Autodemo;
  private readonly recentDemos: string[];
  private readonly maxRecentDemos = 10;

  constructor(csgoPath?: string, autodemo?: Autodemo) {
    const icon =
      process.platform === 'darwin'
        ? nativeImage.createFromPath(path.join(assetsPath, 'app.png')).resize({
            width: 16,
            height: 16,
          })
        : process.platform === 'win32'
        ? nativeImage.createFromPath(path.join(assetsPath, 'app.ico'))
        : nativeImage.createEmpty();

    this.csgoPath = csgoPath;
    this.autodemo = autodemo;
    this.tray = new Tray(icon);
    this.recentDemos = this.lookForInitialDemos();
    this.recreateMenu();

    autodemo?.on('recordingStarted', async demoName => {
      await this.addNewDemoToRecent(demoName);
    });

    this.tray.setToolTip(packageJson.productName);
  }

  async addNewDemoToRecent(demoName: string) {
    if (!this.csgoPath) return;

    await delay(100);
    const fullPath = path.join(this.csgoPath, demoName);
    try {
      await fs.promises.stat(fullPath);
    } catch (e) {
      log.error(`Demo does not exist: ${demoName}`);
      log.error(e);
      return;
    }
    if (this.recentDemos.length === this.maxRecentDemos) {
      this.recentDemos.pop();
      this.recentDemos.unshift(fullPath);
    }
    this.recreateMenu();
  }

  lookForInitialDemos(): string[] {
    if (!this.autodemo) return [];

    return this.autodemo.existingDemos(false).slice(0, this.maxRecentDemos);
  }

  recreateMenu() {
    const recentSubmenu = this.csgoPath
      ? this.buildRecentDemosSubmenu(this.csgoPath)
      : [];

    const menu = Menu.buildFromTemplate([
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

    this.tray.setContextMenu(menu);
  }

  buildRecentDemosSubmenu(csgoPath: string): MenuItemConstructorOptions[] {
    const items: MenuItemConstructorOptions[] = this.recentDemos.map(x => ({
      label: path.parse(x).name,
      click: () => shell.showItemInFolder(x),
    }));
    items.unshift({
      label: 'Open Demos Location',
      click: () =>
        shell.showItemInFolder(
          this.recentDemos?.[0] ??
            path.join(csgoPath, this.autodemo?.demosFolder ?? 'bin'),
        ),
    });

    return items;
  }
}
