import { BrowserWindow, ipcMain } from 'electron';
import { Config } from '../common/types/config';

export function setupConfigMain(mainWindow: BrowserWindow, store: Config) {
  ipcMain.handle('store-read', (event, key) => store.read(key));
  ipcMain.handle('store-write', async (event, key, value) => {
    await store.write(key, value);
    return value;
  });
  ipcMain.handle('store-reset', () => store.reset());
}
