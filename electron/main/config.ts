import { ipcMain, app } from 'electron';
import { createStore } from '../common/config';
import log from 'electron-log';

const storePath = app.getPath('userData');
log.info(`\n\nStore path: ${storePath}\n\n`);
export const store = createStore(storePath);

export function setupConfigMain() {
  // @ts-ignore
  ipcMain.handle('store-read', (event, key) => store.read(key));
  ipcMain.handle('store-write', async (event, key, value) => {
    // @ts-ignore
    await store.write(key, value);
    return value;
  });
  ipcMain.handle('store-reset', () => store.reset());
}
